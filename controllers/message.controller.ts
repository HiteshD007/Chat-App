import * as dotenv from 'dotenv';
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import streamifier from 'streamifier';
import Message from '../schema/message.schema';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  
});

// const files = req.files <- after uploading to multer (and send data using formData)
// fileBuffer <- attribute after storing file to multer
export const uploadFilesUsingMulter = async (fileBuffer:Buffer,name:string) => {
  return new Promise<UploadApiResponse | undefined>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: "auto",
      public_id: name
    },(error, result) => {
      if(error) reject(error);
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}



export const uploadMediaToCloudinary = async (data:{
  filePath:string,
  fileName:string, 
  type: "image"|"video"|"raw"
}) => {

  const { filePath, fileName, type } = data;
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: type,
    public_id: fileName
  }).catch((error) => {
    if(error){
      console.log(error);
      return null;
    }
  });
  return result;
}


export const storeTextMessageToDb = async(data:{
  senderId: string,
  roomId: string,
  content: string
}) => {
  try {

    const {senderId, roomId, content} = data;
    const message = await Message.create({
      sender:senderId,
      roomId,
      messageType: "text",
      content
    });

    await message.populate({
      path: 'sender',
      select: '_id username profilePic'
    });
    return message;
  } catch (error) {
    console.log("Error in [SEND MESSAGE]",error);
    return null;
  }
}

export const storeMediaMessageToDb = async(data:{
  senderId: string,
  roomId: string,
  content: string,
  messageType: "text" | "image" | "pdf" | "video" | "audio" | "application" | "txt" | "gif",
}) => {
  try {

    const {senderId, roomId, content, messageType} = data;
    const message = await Message.create({
      sender:senderId,
      roomId,
      messageType,
      content
    });

    await message.populate({
      path: 'sender',
      select: '_id username profilePic'
    });
    return message;
  } catch (error) {
    console.log("Error in [SEND MESSAGE]",error);
    return null;
  }
}



export const getMessagesOfRoom = async(roomId:string) => {
  try {
    const messages = await Message.find({roomId}).populate({path: 'sender', select: '_id username profilePic'});
    return messages;
  } catch (error) {
    return null;
  }
}