import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  roomId: {
    type: String, 
    required: true,    
  },
  messageType:{
    type: String,
    enum: ["text","image","pdf","video","audio","application","txt","gif"],
    required: true,
  },
  content: { 
    type: String, 
    required: true 
  },
  status:{
    type: String,
    enums: ["sent","delivered","read"],
    default: "sent"
  }
},{timestamps:true});

const Message = mongoose.models.Message || mongoose.model('Message',MessageSchema);

export default Message;