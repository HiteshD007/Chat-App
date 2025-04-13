import Server from "../schema/server.schema";
import Channel from "../schema/channel.schema";

import { AuthenticatedRequest } from "../configs/types";
import User from "../schema/user.schema";
import mongoose from "mongoose";
import { getServerById, getUserById } from "../utils/general-function";

export const createServerSocket = async(data: {serverName:string, displayImg:string}, userId:string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {serverName, displayImg} = data;
    let server = new Server({
      name: serverName,
      displayImg,
      owner: userId,
      members: [userId],
    });

    let textChannel = new Channel({
      name: "general",
      server: server._id,
      type: "text",
    });

    let voiceChannel = new Channel({
      name: "General",
      server: server._id,
      type: "voice",
    });

    await server.save({session}),
    await textChannel.save({session}),
    await voiceChannel.save({session}),

    await Server.findByIdAndUpdate(server._id, {
        $addToSet: { channels: { $each: [textChannel._id, voiceChannel._id] } },
    },{session}),

    await User.findByIdAndUpdate(userId,{
      $addToSet: {servers: server._id}
    },{session});

    await session.commitTransaction();
    server = await getServerById(server._id);
    return server;
  
  } catch (error:any) {
    await session.abortTransaction();
    console.log("Error in Create Server",error.message);
    return null;
  }finally{
    session.endSession();
  }
};

// await Server.findByIdAndUpdate(
//   "server123",
//   { $addToSet: { members: "user3" } }, // Adds user3 without removing user1 & user2
// );

export const deleteServer = async (req: AuthenticatedRequest, res:any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.userId;
    const { serverId } = req.body;

    const server = await Server.findOneAndDelete({_id: serverId, owner: userId},{session});
    if(!server) {
      await session.abortTransaction();
      return res.status(401).json({error:true,message: "UnAuthorized Action!!"});
    }

    await session.commitTransaction();
    return res.status(200).json({
      success:true,message:`${server.name} Deleted Permanently!!`,
    });
  } catch (error:any) {
    await session.abortTransaction();
    console.log("Error in [DELETE SERVER]",error.message);
    return res.status(500).json({message: "Internal Server Error"});
  }finally{
    session.endSession();
  }
};


export const joinServer = async (data:{userId:string, serverId: string}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { serverId,userId } = data;

    const updatedServer = await Server.findByIdAndUpdate(serverId,{
      $addToSet: {members: userId}
    },{new:true,session});

    const updatedUser = await User.findByIdAndUpdate(userId,{
      $addToSet: {servers: serverId}
    },{new:true,session}).select("_id username email displayImg");

    if(!updatedServer || !updatedUser) {
      await session.abortTransaction();
      return null;
    }
    await session.commitTransaction();

    const server = await getServerById(updatedServer._id);
    return server;
  
  } catch (error:any) {
    await session.abortTransaction();
    console.log('Error in [JOIN SERVER]',error.message);
    return null;
  }finally{
    await session.endSession();
  }
}


export const leaveServer = async (req:AuthenticatedRequest, res:any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.userId;
    const { serverId } = req.body;

    const updatedServer = await Server.findByIdAndUpdate(serverId,{
      $pull: {members: userId}
    },{new:true,session});

    const updatedUser = await User.findByIdAndUpdate(userId,{
      $pull: {servers: serverId}
    },{new:true,session});

    if(!updatedServer || !updatedUser) {
      await session.abortTransaction();
      return res.status(400).json({error:true,message:"can't leave server"});
    }

    const data = await getUserById(userId);
    await session.commitTransaction();

    return res.status(200).json({
      success:true,
      user:data?.user,
      servers:data?.servers,
      friends:data?.friends
    });
  
  } catch (error:any) {
    await session.abortTransaction();
    console.log('Error in [LEAVE SERVER]',error.message);
    return res.status(500).json({message:"Internal Server Error"});
  }finally{
    await session.endSession();
  }
}



export const addChannel = async (data:{
  serverId: string,
  channelName: string,
  type: 'text' | 'voice',
  isPrivate: boolean,
  permittedUsers: []
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { serverId, channelName, type, isPrivate, permittedUsers } = data;
    const server = await Server.findById(serverId).select('_id');

    if(!server) return {serverNotFound:true};

    const channel = new Channel({
      name: channelName,
      server: serverId,
      type,
      isPrivate,
      permittedUsers,
    });

    await channel.save({session});
    await Server.findByIdAndUpdate(serverId,{
      $addToSet: {channels: channel._id}
    },{session});

    await session.commitTransaction();
    return channel;
    
  } catch (error:any) {
    await session.abortTransaction();
    console.log('Error in [Add Channel]',error.message);
    return null;
  }finally{
    session.endSession();
  }
}
