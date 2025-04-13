import { Copy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

import { Label } from "../ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useServerStore } from "@/store/zustand.store";
import { Button } from "../ui/button";
import { socket } from "@/lib/socket";

interface ServerInviteDialogProps{
  open: boolean,
  onOpenChange:(open:boolean) => void
}

const ServerInviteDialog:React.FC<ServerInviteDialogProps> = ({
  open,
  onOpenChange
}) => {

  const { selectedServer } = useServerStore();
  const [inviteLink, setInviteLink] = useState<string>("");

  const createInvite = async() => {
    socket.emit('create_invite_link_server',{serverId: selectedServer?._id , expiresIn: "30min"});
  }

  socket.on("error_in_generating_invite_link",({message}) => {
    toast.error(message,{
      duration: 1000
    });
    onOpenChange(false);
  })

  socket.on('generated_invite_link',({inviteLink}) => {
    setInviteLink(inviteLink);
  });

  const onCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Link copied',{
      duration: 1000
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[600px] sm:max-w-full">
        <DialogHeader>
          <DialogTitle> Invite People </DialogTitle>
          <DialogDescription>
            invite link, users use this to join this server
          </DialogDescription>
        </DialogHeader>

        {inviteLink === "" ? (
          <Button variant={"blue"} onClick={createInvite}>
            Generate Invite Link
          </Button>
        ):(
          <>
            <Label className="h-14 w-full border-2 border-ring outline-2 rounded-md px-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold max-w-[470px] overflow-x-scroll select-text h-scrollbar">
                {inviteLink}
              </h1>
              <Copy onClick={onCopy}/>
            </Label>
            <Button variant={"blue"} onClick={createInvite}>
              Generate New Invite Link
            </Button>
            <DialogDescription className="p-0">
              link will expire in 30 min
            </DialogDescription>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default ServerInviteDialog;
