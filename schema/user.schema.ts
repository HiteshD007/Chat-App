import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic:{
    type: String,
    default: ""
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true,
    minLength: 6
  },
  friends: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  servers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Server" 
  }],
},{timestamps:true});

const User = mongoose.models.User || mongoose.model('User',userSchema);

export default User;