import { io } from 'socket.io-client';
import SocketIoFileClient from 'socket.io-file-client';

import { useAuthStore, useFriendStore, useLoadingStore, useServerStore, useMessageStore, useRequestStore, useOnlineUserStore, useChatStore } from '@/store/zustand.store';
import { toast } from 'sonner';


export const socket = io("http://localhost:5000",{
  autoConnect: false
});
const uploader = new SocketIoFileClient(socket);

export const uploadFiles = (files:File[],data?: any) => {

  uploader.upload(files,{
    uploadTo: 'uploads',
    data: data
  });
  uploader.on('start', function() {
    toast('sending files',{
      duration: 500
    });
  });
  uploader.on('stream', function() {});
  uploader.on('complete', function() {
      toast.success('file sent');
  });
  uploader.on('error', function(err) {
      toast.error('cannot send file', err);
  });
  uploader.on('abort', function(){});
}

const { setUser, setIsAuthenticated, setRoomId } = useAuthStore.getState();
const {setFriends, addFriend, removeFriend } = useFriendStore.getState();
const {setServers, addServer, addChannel, setSelectedServer, removeServer } = useServerStore.getState();
const { setIsLoading } = useLoadingStore.getState();
const { setMessages, addNewMessage } = useMessageStore.getState();
const { setRequests, addRequest, removeRequest } = useRequestStore.getState();
const { setOnlineUsers } = useOnlineUserStore.getState();
const { setChat } = useChatStore.getState();

socket.on('updated_online_users',(onlineUsers) => {
  setOnlineUsers(onlineUsers);
});


socket.on('connect' , () => {
  socket.once('user_info',({user, friends, servers, isAuthenticated, requests}) => {
      setUser(user);
      setFriends(friends);
      setServers(servers);
      setIsAuthenticated(isAuthenticated);
      setRequests(requests);
      setIsLoading(false);
  });
});

socket.on('auth_error',({isAuthenticated, message}) => {
  setIsAuthenticated(isAuthenticated);
  toast.error(message,{
    duration: 1000
  });
});

socket.on('user_disconnect',({isAuthenticated}) => {
  setIsAuthenticated(isAuthenticated);
});

//MARK: ROOM_ID
socket.on('room_id',({roomId}) => {
  setRoomId(roomId);
});


socket.on('server_created',({server}) => {
  addServer(server);
  toast.success('server created.',{
    duration: 1000
  });
});

socket.on('server_create_error',({message}) => {
  toast.error(message,{
    duration: 1000
  });
});

socket.on('server_deleted',({serverName, serverId}) => {
  removeServer(serverId);
  setSelectedServer(null);
  toast.success(`${serverName} deleted permanently`,{
    duration: 1000
  });
});

socket.on('server_delete_error',({message}) => {
  toast.error(message,{
    duration: 1000
  });
});


socket.on('server_leaved',({serverName, serverId}) => {
  removeServer(serverId);
  setSelectedServer(null);
  setChat(null);
  toast.success(`${serverName} leaved...`,{
    duration: 1000
  });
});

socket.on('server_leave_error',({message}) => {
  toast.error(message,{
    duration: 1000
  });
});




socket.on('error_joining_server',({message}) => {
  toast.error(message,{
    duration: 1000
  });
});

socket.on('server_invite_accepted',({server}) => {
  addServer(server);
  toast.success(`Server Joined: ${server?.name}`,{
    duration: 1000
  });
});


//MARK: CREATE CHANNEL 
socket.on('channel_created',({channel}) => {
  addChannel(channel);
  toast.success('channel added.',{
    duration: 1000
  });
});

socket.on('channel_create_error',({message}) => {
  toast.error(message,{
    duration: 1000
  });
});

socket.on('server_not_found',({message}) => {
  toast.error(message,{
    duration: 1000
  });
});


//MARK: MESSAGES
socket.on('get_old_messages',({messages}) => { 
  setMessages(messages);
}); 

socket.on('receive_message',({message}) => {
  addNewMessage(message);
}) 

socket.on('send_message_error',({message}) => {
  toast.error(message,{
    duration: 1000
  });
});

//MARK: Friend Requests
socket.on('friend_request_sent',({message}) =>{
  toast.success(message,{
    duration: 1000
  });
});

socket.on('request_already_sent',({message}) =>{
  toast.error(message,{
    duration: 1000
  });
});

socket.on('new_friend_request',({request}) => {
  addRequest(request);
});


socket.on('friend_request_accepted',({friend,requestId}) =>{
  addFriend(friend);
  if(requestId) removeRequest(requestId);
})

socket.on('error_accepting_request',({message}) => {
  toast.error(message,{
    duration:1000
  });
});

socket.on('request_declined',(deletedRequest) => {
  removeRequest(deletedRequest?._id);
});

socket.on('error_decline_request',({message}) => {
  toast.error(message,{
    duration:1000
  });
});

socket.on('friend_removed',({friendId}) => {
  removeFriend(friendId);
});

socket.on('error_removing_friend',({message}) => {
  toast.error(message,{
    duration:1000
  });
});



//MARK: Logout 
socket.on('logged_out',() => {
    setUser(null);
    setFriends([]);
    setServers([]);
    setIsAuthenticated(false);
    setRequests([]);
    setOnlineUsers([]);
    socket.disconnect();
})
