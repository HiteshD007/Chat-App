import { AuthenticatedRequest } from "../configs/types";
import Invite from "../schema/invite-links.schema";
import crypto from 'crypto';
import { getServerById } from "../utils/general-function";


export const generateInviteLink = async (data:{serverId: string, expiresIn: string }) => {
  try {
    const { serverId, expiresIn } = data;

  const durationMap: Record<string, number|null> = {
    "30min": 30 * 60 * 1000,
    "1hr": 60 * 60 * 1000,
    "6hr": 6 * 60 * 60 * 1000,
    "12hr": 12 * 60 * 60 * 1000,
    "1day": 24 * 60 * 60 * 1000,
    "3day": 3 * 24 * 60 * 60 * 1000,
    "7day": 7 * 24 * 60 * 60 * 1000,
    "never": null, // Special case for never-expiring invites
  };

    const duration = durationMap[expiresIn];
    const expiresAt = duration !== null ? new Date(Date.now() + duration) : null;

    const token = crypto.randomBytes(16).toString("hex");
    const link = new Invite({
      token,
      serverId,
      expiresAt,
    });
    await link.save();
    const inviteLink = `${process.env.URL}/invite/${token}`
    return inviteLink;

  } catch (error) {
    console.log('Error in Generating Invite Link');
    return null;
  }
}

export const verifyInviteLink = async(data:{ token : string, userId: string}) => {
  try {
    const { token, userId } = data;
    const invite = await Invite.findOne({token});
    if(!invite) return 410; // 410 => Invalid Invite
    const server = await getServerById(invite.serverId);
    if(!server) return 404; // 404 => not found

    const isAlreadyMember = server.members.find((m:any) => m._id == userId);
    
    if(isAlreadyMember){
      return { server, alreadyJoined: true }
    }
    return { server, alreadyJoined: false };
  } catch (error) {
    console.error('Error in Verifying Invite Link',error);
    return null;
  }
}
