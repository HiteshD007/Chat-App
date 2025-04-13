import mongoose from "mongoose";
import User from "../schema/user.schema";
import Request from "../schema/request.schema";

export const acceptFriendRequest = async (requestId:string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const request = await Request.findById(requestId);
    if(!request) {
      await session.abortTransaction();
      return null;
    }
    const {sender, to} = request;
    await User.findByIdAndUpdate(sender,{
      $addToSet: { friends: to }
    },{session});
    await User.findByIdAndUpdate(to,{
      $addToSet: { friends: sender }
    },{session});

    await Request.findOneAndDelete({sender,to},{session});
    await Request.findOneAndDelete({sender:to,to:sender},{session});

    await session.commitTransaction();
    const toSender = await User.findById(to).select('_id username profilePic');
    const toReceiver = await User.findById(sender).select('_id username profilePic');
    return {toSender, toReceiver, request};
  } catch (error) {
    await session.abortTransaction();
    console.log('Error in adding friend',error);
    return null;
  }finally{
    session.endSession();
  }
}

export const declineFriendRequest = async (requestId:string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const deletedRequest = await Request.findByIdAndDelete(requestId,{session});
    await session.commitTransaction();
    return deletedRequest; 
  } catch (error) {
    await session.abortTransaction();
    console.log('Error in adding friend',error);
    return null;
  }finally{
    session.endSession();
  }
}


export const removeFriend = async(userId:string, friendId: string) =>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await User.findByIdAndUpdate(userId,{
      $pull: {friends: friendId}
    },{session});

    await User.findByIdAndUpdate(friendId,{
      $pull: { friends: userId}
    },{session});

    await session.commitTransaction();
    return true;

  } catch (error) {
    await session.abortTransaction();
    console.log('Error in removing Friend',error);
    return null;
  }finally{
    session.endSession();
  }
}



