import { Socket, Server as SocketIoServer } from 'socket.io';
import SocketIOFile from 'socket.io-file';
import { verifyToken } from '../configs/verifyToken';
import { getUserById, getUserRequestByReceiver } from '../utils/general-function';
import { addChannel, createServerSocket, joinServer } from '../controllers/server.controller';
import { getMessagesOfRoom, storeMediaMessageToDb, storeTextMessageToDb, uploadMediaToCloudinary } from '../controllers/message.controller';
import User from '../schema/user.schema';
import Request from '../schema/request.schema';
import { generateInviteLink, verifyInviteLink } from '../controllers/invite.controller';
import { acceptFriendRequest, declineFriendRequest, removeFriend } from '../controllers/request.controller';

const onlineUsers = new Map();

export const useSocketUser = async (socket:Socket, io:SocketIoServer, uploader:SocketIOFile) => {
  try {
    const userId = userIdFromToken(socket);
    console.log('User',userId,' => ',socket.id);

    const data = await getUserById(userId);
    if(!data) return socket.disconnect();

    const requests = await getUserRequestByReceiver(userId);
    
    onlineUsers.set(userId,socket.id);
    
    socket.emit('user_info',{ user:data.user, servers:data.servers, friends: data.friends, isAuthenticated: true, requests});
    io.emit('updated_online_users',Array.from(onlineUsers.keys()));

    registerUserEvents(socket, io,uploader);

    socket.on('disconnect',() => {
      socket.emit("user_disconnect", {
        isAuthenticated: false,
      });
      onlineUsers.delete(userId);
      io.emit('updated_online_users',Array.from(onlineUsers.keys()));
      console.log('User Disconnected', socket.id);
    })
  } catch (err:any) {
    console.error("Socket auth error:", err.message);
    socket.emit("auth_error", {
      isAuthenticated: false,
      message: "Authentication failed. Please log in again.",
    });
    socket.disconnect();
  }
};


//MARK: UserId socket
const userIdFromToken = (socket:Socket) => {
    const decoded = verifyToken(socket.handshake.auth?.token, process.env.ACCESS_TOKEN_SECRET!);
    if(!decoded) {
    socket.emit("auth_error", {
      isAuthenticated: false,
      message: "Authentication failed. Please log in again.",
    });
    socket.disconnect();
    return;
    };
    return decoded.userId;
}


export const registerUserEvents = (socket: Socket, io: SocketIoServer, uploader: SocketIOFile) => {
  
  socket.on('create_server', async(data) => {
    const userId = userIdFromToken(socket);
    const server = await createServerSocket(data,userId);
    if(!server) {
      socket.emit('server_create_error',{ message: 'Cannot create server' });
      return;
    }
    socket.emit('server_created', {server});
  });


  socket.on('create_invite_link_server', async({serverId, expiresIn}) => {
    const inviteLink = await generateInviteLink({serverId,expiresIn});

    if(!inviteLink){
      socket.emit('error_in_generating_invite_link',{message:"cannot generate invite link"});
      return;
    }
    socket.emit('generated_invite_link',{inviteLink});
  });

  socket.on('verify_invite_link', async({inviteToken}) => {
    if(!inviteToken){
      socket.emit('invalid_invite', {message:"Invalid Invite Link"});
    }
    const userId = userIdFromToken(socket);
    const response = await verifyInviteLink({token:inviteToken,userId});

    if(response === 404) {
      socket.emit('server_not_found',{message:"server not found"});
    }else if(response === 410){
      socket.emit('invalid_invite', {message:"Invalid Invite Link"});
    }else{
      socket.emit('invite_verified',{ server : response?.server , alreadyJoined: response?.alreadyJoined })
    }
  });

  socket.on('accept_invite', async({serverId}) => {
    const userId = userIdFromToken(socket);
    const server = await joinServer({serverId, userId});

    if(!server){
      socket.emit('error_joining_server',{message:"cannot join server"});
      return;
    }
    socket.emit('server_invite_accepted',{server});

  });


  socket.on('create_channel', async(data) => {
    userIdFromToken(socket);
    const channel = await addChannel(data);

    if(!channel) {
      socket.emit('channel_create_error',{message: 'cannot create channel'});
      return;
    }
    if(channel?.serverNotFound){
      socket.emit('server_not_found',{message: "cannot find server"});
      return;
    }

    socket.emit('channel_created',{channel});
  });

  //MARK: JOIN CHANNEL OR DM
  socket.on('join_channel', async({channelId}) => {
    const userId = userIdFromToken(socket);
    for(const room of socket.rooms){
      if(room !== socket.id) {
        console.log(`${userId} leaves ${room}`);
        socket.leave(room);
      } 
    }
    socket.join(`channel_${channelId}`);
    console.log(`${userId} joins channel_${channelId}`);
    socket.emit('room_id',{roomId:`channel_${channelId}`});
    
    const messages = await getMessagesOfRoom(`channel_${channelId}`);
    if(!messages) {
      console.log('ERROR IN GETTING MESSAGES');
      return;  
    }
    socket.emit('get_old_messages',{messages});
  });

  function getDMRoomId(user1Id:string, user2Id:string) {
    return `dm_${[user1Id, user2Id].sort().join('_')}`;
  }

  socket.on('join_dm', async({friendId}) => {
    const userId = userIdFromToken(socket);
    for(const room of socket.rooms){
      if(room !== socket.id) {
        socket.leave(room);
        console.log(`${userId} leaves ${room}`);
      }
    }
    const roomId = getDMRoomId(userId, friendId);
    socket.join(roomId);
    console.log(`${userId} joins ${roomId}`);
    socket.emit('room_id',{roomId});
    const messages = await getMessagesOfRoom(roomId);
    if(!messages) {
      console.log('ERROR IN GETTING MESSAGES');
      return;  
    }
    socket.emit('get_old_messages',{messages});
  });


  //MARK: SEND MESSAGE
  socket.on('send_message',async(data) => {
    const message = await storeTextMessageToDb(data);
    if(!message) {
      socket.emit('send_message_error',{message:'cannot send message'});
      return;
    }
    io.to(data.roomId).emit('receive_message',{message});
  });

  uploader.on('complete', async(fileInfo) => {
    const type = getMessageType(fileInfo.mime);
    const meta = (Array.isArray(fileInfo.data) ? fileInfo.data[0] as metaData : fileInfo.data as metaData);
    console.log(socket.rooms);

    const resourceType =  (type === "image") ? "image" : (type === "video") ? "video" : "raw";

    const uploadResult = await uploadMediaToCloudinary({fileName:fileInfo.name, filePath:fileInfo.uploadDir, type: resourceType});

    if(!uploadResult) {
      socket.emit('send_message_error',{message:'cannot send message'});
      return;
    }

    const mediaMessage = await storeMediaMessageToDb({
      senderId: meta.senderId,
      roomId: meta.roomId,
      content: uploadResult?.secure_url as string,
      messageType: type
    });

    if(!mediaMessage){
      socket.emit('send_message_error',{message:'cannot send message'});
      return;
    }

    io.to(meta.roomId).emit('receive_message',{message:mediaMessage});
    
    if(meta.content !== ""){
      const message = await storeTextMessageToDb({
        senderId: meta.senderId,
        roomId: meta.roomId,
        content: meta.content
      });
      if(!message) {
        socket.emit('send_message_error',{message:'cannot send message'});
        return;
      }
      io.to(meta.roomId).emit('receive_message',{message});
    }
  });

  //MARK: Friend Requests
  socket.on("search_friend",async({username}) => {
    const friend = await User.findOne({username}).select('_id username profilePic');
    socket.emit('requested_friend',{friend});
  });

  socket.on('send_friend_request',async({to}) => {
    const userId = userIdFromToken(socket);
    const alreadySent = await Request.findOne({sender:userId,to});
    if(alreadySent){
      socket.emit('request_already_sent',{message:"friend request already sent"});
      return;
    }
    const request = await Request.create({
      sender: userId,
      to
    });
    await request.populate({
      path: "sender",
      select: "_id username profilePic"
    });
    socket.emit('friend_request_sent',{message:"friend request sent"});
    const emitTo = onlineUsers.get(to);
    if(emitTo){
      io.to(emitTo).emit('new_friend_request',{request});
    }
  });

  socket.on('accept_friend_request',async({requestId}) => {
    const data = await acceptFriendRequest(requestId);
    if(!data){
      socket.emit('error_accepting_request',{message:'cannot accept request'});
      return;
    }

    socket.emit('friend_request_accepted',{friend:data.toReceiver, requestId});
    const emitTo = onlineUsers.get(String(data.toReceiver._id));
    console.log(onlineUsers);
    console.log(emitTo);
    if(emitTo){
      io.to(emitTo).emit('friend_request_accepted',{friend:data.toSender});
    }
  });

  socket.on('decline_friend_request',async({requestId}) => {
    const deletedRequest = await declineFriendRequest(requestId);

    if(!deletedRequest){
      socket.emit('error_decline_request',{message: 'cannot decline request. Try later'});
      return;
    }
    socket.emit('request_declined',deletedRequest);
  });

  socket.on('remove_friend',async({friendId}) => {
    const userId = userIdFromToken(socket);
    const data = await removeFriend(userId, friendId);
    if(!data){
      socket.emit('error_removing_friend',{message:'cannot remove friend. Try later!!'});
      return;
    }
    socket.emit('friend_removed',{friendId});
    const emitTo = onlineUsers.get(friendId);
    if(emitTo){
      io.to(emitTo).emit('friend_removed',{friendId:userId});
    }
  });

  //MARK: LOGOUT
  socket.on('logout',() => {
    socket.emit('logged_out');
  });
};


// MARK: MetaData for upload Media
interface metaData{
  senderId: string,
  roomId: string,
  content: ""
}

const getMessageType = (mime:string) => {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'text/html') return 'gif';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('text/')) return 'txt';
  return 'application'; // fallback
}


