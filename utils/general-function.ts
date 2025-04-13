import mongoose from "mongoose";
import User from "../schema/user.schema";
import Server from "../schema/server.schema";
import Request from "../schema/request.schema";

export const getUserById = async (id:mongoose.Schema.Types.ObjectId) => {
  try {
    const user = await User.findById(id).populate({
      path: 'friends',
      select: '_id username profilePic'
    }).populate({
      path: 'servers',
      populate:[
        {
          path: 'members',
          select: '_id username profilePic'
        },
        {
          path: 'channels',
          select: '_id name type isPrivate permittedUsers',
          populate: { 
            path : 'permittedUsers',
            select: '_id username profilePic'
          }
        },
      ]
    });
    if(!user) return null;

    const sendUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic
    }
    
    const data = {
      servers: user.servers,
      friends: user.friends,
      user:sendUser
    }


    return data;

  } catch (error) {
    console.log('Error in Fetching UserById');
  }
}


export const getServerById = async (id:mongoose.Schema.Types.ObjectId) => {
  try {
    const server = await Server.findById(id).populate([
        {
          path: 'members',
          select: '_id username profilePic'
        },
        {
          path: 'channels',
          select: '_id name type isPrivate permittedUsers',
          populate: { 
            path : 'permittedUsers',
            select: '_id username profilePic'
          }
        },
      ]);

    if(!server) return null;
    return server;

  } catch (error) {
    console.log('Error in Fetching ServerById');
    return null;
  }
}

export const getUserRequestByReceiver = async(receiverId:mongoose.Schema.Types.ObjectId) => {
  try {

    const requests = await Request.find({to:receiverId}).populate({
      path: "sender",
      select: "_id username profilePic"
    });
    return requests;
  } catch (error) {
    console.log('Error in Fetching RequestsById');
    return null;
  }
}