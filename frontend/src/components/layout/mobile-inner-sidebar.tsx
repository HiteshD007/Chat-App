import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import { 
  SidebarProvider,
  Sidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarContent,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
 } from "@/components/ui/sidebar";


import { Button } from "@/components/ui/button";
import Friends from '@/components/icons/friends';
import { useFriendStore, useChatStore, chatType, useOnlineUserStore, useServerStore, useMessageStore, useAuthStore } from '@/store/zustand.store';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { channelInterface, friendInterface } from '@/lib/types';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Hash, MessageSquare, MessageSquareLock, Volume2 } from 'lucide-react';
import ServerDropdown from './server-dropdown';

const MobileInnerSidebar = ({openSheet}:{openSheet: () => void}) => {

  const { user } = useAuthStore();
  const {selectedServer} = useServerStore();
  const { onlineUsers } = useOnlineUserStore(); 
  const { friends } = useFriendStore();
  const { setChat } = useChatStore();
    const { messages } = useMessageStore();

  const handleDirectMessage = (f:friendInterface) => {
    const friendChat:chatType = {
      id: f._id,
      name: f.username,
      profilePic: f.profilePic,
      isDM: true,
      participants:[],
    }
    setChat(friendChat);
    socket.emit('join_dm',{friendId:friendChat.id});
    openSheet();
  }

  const hasBanner = selectedServer?.bannerImg;
  const channels = selectedServer?.channels || [];
  const members = selectedServer?.members || [];

  const onChannelSelect = (channel:channelInterface) => {
    const isUserPermitted = user?._id === selectedServer?.owner || channel.permittedUsers.find((u) => u._id === user?._id)
    if(channel.isPrivate && !isUserPermitted) {
      toast('only permitted users can view this channel');
      return;
    };
    socket.emit('join_channel',{channelId: channel._id});
    const participants = channel.isPrivate ? channel.permittedUsers : members;
    const chat = {
      id: channel._id,
      name: channel.name,
      participants,
      messages
    }
    setChat(chat);
    openSheet();
  }

  return (
    <>
      <SidebarProvider
        className='flex-1'
        style={{
          "--sidebar-width" : "15rem"
        } as React.CSSProperties}
      >
        <Sidebar collapsible="none" className="border-x-1 border-gray-500/40 relative min-h-svh max-h-svh w-full md:w-(--sidebar-width) lg:w-[20rem]">
          <OverlayScrollbarsComponent
            className='scrollbar'
            defer
            options={{scrollbars:{autoHide:"scroll"}}}
          >
            {selectedServer === null ? (
              <SidebarContent className="gap-0 mt-14">
                <SidebarMenu>
                  <SidebarMenuItem className='my-2 mx-4'>
                    <SidebarMenuButton className='h-10' onClick={() => {setChat(null); openSheet();}}>
                      <Friends size={20}/>
                      <p>Friends</p>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                
                  <SidebarSeparator className='mx-0'/>

                  {friends.length === 0 && (
                    <SidebarMenuItem className='text-center my-3'>
                      <p>
                        No friends🥲🥲🥺
                      </p>
                      <p>
                        Add some😁😁😉
                      </p>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>

                {friends.map((f) => (
                  <SidebarGroup key={f._id}>
                    <SidebarGroupLabel className="text-small ">Direct Messages</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <div className='flex items-center gap-x-2 hover:bg-accent p-2 rounded-md'
                          onClick={() => handleDirectMessage(f)}
                        >
                          <Avatar className={cn(`h-10 w-10`,onlineUsers.includes(f._id) ? "border-2 border-green-500" : "border-2 border-slate-500")}>
                            <AvatarImage src="https://github.com/shadcn.png"/>
                          </Avatar>
                          <h1 className="text-lg leading-4">{f.username}</h1>
                        </div>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ))}
              </SidebarContent>
            ):(
              <SidebarContent className="gap-0">
                {hasBanner && (
                  <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                      <img src={selectedServer?.bannerImg} alt="" 
                      className="object-center object-cover aspect-[1/0.4]"
                      />
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}

                {channels.length > 0 && (
                  <SidebarMenu className={`${hasBanner ? "mt-2" : "mt-14"}`}>
                    {channels.map((channel) => (
                      <SidebarMenuItem className='mt-2' key={channel._id}>
                        <SidebarMenuButton onClick={() => onChannelSelect(channel)}>
                          <Hash />
                          {channel.type === "text" ? (channel.isPrivate ? <MessageSquareLock /> : <MessageSquare />):(
                            <Volume2 />
                          )}
                          <p>{channel.name}</p>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </SidebarContent>
            )}
          </OverlayScrollbarsComponent>

          {selectedServer === null ? (
            <div className="h-14 w-full absolute top-0 left-0 flex bg-transparent items-center justify-center border-b-2">
              <Button className="cursor-pointer text-[12px] h-7 py-0 w-[90%] hover:brightness-150" variant="secondary">
                Find or start a conversation
              </Button>
            </div>
          ):(
            <ServerDropdown />
          )}
        </Sidebar>
      </SidebarProvider>
    
    </>
  );
};

export default MobileInnerSidebar;
