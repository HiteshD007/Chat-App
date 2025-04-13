import mongoose from 'mongoose';
import Channel from './channel.schema';
import User from './user.schema';


const ServerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
  },
  displayImg:{
    type: String,
    default: "",
  },
  bannerImg:{
    type: String,
    default: ""
  },
  owner: { type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  channels: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Channel" 
  }]
},{timestamps:true});


// Middleware for deleting a server
ServerSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const channelIds = await Channel.find({ server: this._id });
  await Channel.deleteMany({ _id: { $in: channelIds } });
  await User.updateMany({ servers: this._id }, { $pull: { servers: this._id } });
  next();
});


ServerSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getQuery()); // Get the document being deleted
  if (!doc) return next(); // If no document found, skip
  const channelIds = await Channel.find({ server: doc._id });
  await Channel.deleteMany({ _id: { $in: channelIds } });
  await User.updateMany({ servers: doc._id }, { $pull: { servers: doc._id } });
  next();
});

const Server = mongoose.models.Server || mongoose.model('Server',ServerSchema);

export default Server;