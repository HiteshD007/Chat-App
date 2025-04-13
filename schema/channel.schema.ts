import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true 
  },
  server: { // server required as channel belong to any server may not be category
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Server" 
  },
  type: { 
    type: String, 
    enum: ["text", "voice"], 
    default: "text" 
  },
  messages: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Message" 
  }],
  isPrivate:{
    type: Boolean,
    default: false
  },
  permittedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }] // Private channels
},{timestamps:true});


const Channel = mongoose.models.Channel || mongoose.model('Channel',ChannelSchema);

export default Channel;