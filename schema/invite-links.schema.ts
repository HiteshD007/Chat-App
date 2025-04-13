import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  token : {
    type:  String,
    required: true,
    unique: true,
  },
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  expiresAt:{
    type:  Date,
    default: null,
  }
});

inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const Invite = mongoose.models.Invite || mongoose.model('Invite',inviteSchema);

export default Invite;