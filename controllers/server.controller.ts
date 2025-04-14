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

// Delete Server
export const deleteServer = async (data:{serverId: string, userId: string}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { serverId, userId } = data;

    const server = await Server.findOneAndDelete({_id: serverId, owner: userId},{session});
    if(!server) {
      await session.abortTransaction();
      return 401 // unauthorized Action;
    }
    await session.commitTransaction();
    return {serverName: server.name} // success
  } catch (error:any) {
    await session.abortTransaction();
    console.log("Error in [DELETE SERVER]",error.message);
    return 500 // unexpected error
  }finally{
    session.endSession();
  }
};

// Join Server
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

//MARK: Leave Server
export const leaveServer = async (data:{serverId: string, userId: string}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {

    const {serverId, userId} = data;

    const updatedServer = await Server.findByIdAndUpdate(serverId,{
      $pull: {members: userId}
    },{new:true,session});

    const updatedUser = await User.findByIdAndUpdate(userId,{
      $pull: {servers: serverId}
    },{new:true,session});

    if(!updatedServer || !updatedUser) {
      await session.abortTransaction();
      return 400; // cant leave server;
    }

    await session.commitTransaction();

    return {serverName: updatedServer.name}; // success
  
  } catch (error:any) {
    await session.abortTransaction();
    console.log('Error in [LEAVE SERVER]',error.message);
    return 500;
  }finally{
    await session.endSession();
  }
}


// MARK: ADD Channel
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
