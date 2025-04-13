import { useState } from "react";
import { toast } from 'sonner';
import { Button } from "../ui/button";
import { ChevronDown, Plus, UserPlus } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
 } from "../ui/dropdown-menu";


import useFetch from '@/hooks/use-fetch';
import { useAuthStore, useServerStore } from '@/store/zustand.store';

import AddChannelDialog from "../dialogs/add-channel-dialog";
import ServerSettingsDialog from "../dialogs/server-settings-dialog";
import ServerInviteDialog from "../dialogs/server-invite-dialog";

const ServerDropdown = () => {

  //Channel Dialog Controls
  const [addChannelOpen, setAddChannelOpen] = useState<boolean>(false);
  const onAddChannelChange = (open:boolean) => {
    setAddChannelOpen(open)
  };
  const closeAddChannelDialog = () => {
    setAddChannelOpen(false);
  };

  //Server Setting Dialog Controls
  const [serverSettingsOpen, setServerSettingsOpen] = useState<boolean>(false);
  const onSeverSettingsChange = (open:boolean) => {
    setServerSettingsOpen(open);
  }
  const closeServerSettingDialog = () => {
    setServerSettingsOpen(false);
  }


  //Server Invite Dialog 
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  const onInviteOpenChange = (open:boolean) => {
    setInviteOpen(open);
  }
  

  const { user } = useAuthStore();
  const { removeServer, selectedServer, setSelectedServer } = useServerStore();
  

  const { request } = useFetch();
  const onDeleteServer = async () => {
    const data = await request({
      url: "/api/data/delete/server",
      method: "DELETE",
      data: {serverId: selectedServer?._id}
    });
    if(!data) {
      toast.error('Unable to delete Server',{
        duration: 1000
      });
      return;
    }
    toast.success(`Server: ${selectedServer?.name} deleted!!`,{
      duration: 1000,
    });
    removeServer(selectedServer?._id as string);
    setSelectedServer(null);
  };

  const dropdownOptions = [
    {
      name: "Add Channel",
      icon: <Plus />,
      onClick: () => setAddChannelOpen(true),
    },
  ]

  return (
      <div className="h-14 w-full absolute top-0 left-0 flex bg-transparent items-center justify-center border-b-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center justify-between h-full w-full px-4 z-10 rounded-none border-0" variant="glass">
              <p className="text-balance font-semibold ">{selectedServer?.name}</p>
              <ChevronDown size={25}/>
            </Button>
          </DropdownMenuTrigger> 
          <DropdownMenuContent className="w-[220px] rounded-md">
            <DropdownMenuItem 
                className="h-10 flex items-center justify-between"
                onClick={() =>  setInviteOpen(true)}
              >
                Invite
                <UserPlus />
            </DropdownMenuItem>
            {user?._id === selectedServer?.owner && dropdownOptions.map((d) => (
              <DropdownMenuItem 
                key={d.name}
                className="h-10 flex items-center justify-between"
                onClick={d.onClick}
              >
                {d.name}
                {d.icon}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {user?._id === selectedServer?.owner ? (
                <DropdownMenuItem onClick={onDeleteServer} variant='destructive' className="h-10">
                  Delete Server
                </DropdownMenuItem>
            ): (
              <DropdownMenuItem  variant='destructive' className="h-10">
                Leaver Server
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>


        <AddChannelDialog 
          open={addChannelOpen} 
          onOpenChange={onAddChannelChange} 
          closeDialog={closeAddChannelDialog} 
        />

        <ServerSettingsDialog 
          open={serverSettingsOpen}
          onOpenChange={onSeverSettingsChange}
          closeDialog={closeServerSettingDialog}
        />

        <ServerInviteDialog 
          open={inviteOpen}
          onOpenChange={onInviteOpenChange}
        />

      </div>
  )
};

export default ServerDropdown;
