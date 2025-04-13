import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  sender: {
    type: String,
    ref: "User",
    required: true,
  },
  to:{
    type: String,
    ref: "User",
    required: true
  }
},{timestamps:true});

const Request = mongoose.models.Request || mongoose.model('Request',requestSchema);

export default Request;
