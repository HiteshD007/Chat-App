import { 
  SidebarProvider,
  Sidebar,
  SidebarGroup,
  SidebarContent,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
 } from "../ui/sidebar";

import { 
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "../ui/tooltip";


import AddServerButton from "../add-server-button";
import { useAuthStore, useChatStore, useMessageStore, useServerStore } from "@/store/zustand.store";
import { serverInterface } from "@/lib/types";
import { socket } from "@/lib/socket";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

interface OuterSidebarProps{
  isMobile? : boolean,
  openSheet?: () => void
}

const OuterSidebar = ({isMobile=false, openSheet = () => {}}:OuterSidebarProps) => {

  const { user } = useAuthStore();
  const { servers,selectedServer,setSelectedServer } = useServerStore();
  const { messages } = useMessageStore();
  const { setChat } = useChatStore();
  
  const handleDirectMessage = () => {
    setSelectedServer(null);
    setChat(null);
    if(isMobile) openSheet();
  }

  const onSelectServer = (server:serverInterface) => {
    setSelectedServer(server);

    const channel = server.channels.find((f) => !f.isPrivate || f.permittedUsers.find((u) => u._id === user?._id))!;
    const isUserPermitted = user?._id === selectedServer?.owner || channel.permittedUsers.find((u) => u._id === user?._id)
    if(channel.isPrivate && !isUserPermitted) {
      setChat(null);
      return;
    };
    socket.emit('join_channel',{channelId: channel._id});
    const participants = channel.isPrivate ? channel.permittedUsers : server.members;
    const chat = {
      id: channel._id,
      name: channel.name,
      participants,
      messages
    }
    setChat(chat);
    if(isMobile) openSheet();
  }


  return (
    <TooltipProvider>
      <SidebarProvider style={{
        "--sidebar-width" : "5rem"
      } as React.CSSProperties}>
        <Sidebar collapsible="none" className="overflow-hidden max-h-svh">
          <OverlayScrollbarsComponent
            className='scrollbar'
            defer
            options={{scrollbars:{autoHide:"scroll"}}}
          >
            <SidebarContent className="p-4 overflow-hidden min-h-svh">
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu className="items-center w-fit">
                    <Tooltip>
                      <TooltipTrigger>
                        <SidebarMenuItem>
                          <SidebarMenuButton role="button" aria-label="direct message" onClick={handleDirectMessage} variant={"accent"} className="h-12 w-12">
                            <img src="/icons/discord-1.png" alt=""/>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={5}>
                        Direct Message
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator className="m-0"/>


              {servers?.length > 0 &&    
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-y-2 items-center justify-center">
                    {servers.map((s) => (
                        <Tooltip key={s._id}>
                          <TooltipTrigger>
                            <SidebarMenuItem className="sidebarMenuItem">
                              <SidebarMenuButton variant={"blue"} asChild className="h-12 w-12 justify-center" onClick={() => onSelectServer(s)}>
                                {s.displayImg === "" ? 
                                <h1 className="!text-2xl font-normal">
                                  {s.name.charAt(0).toUpperCase()}
                                </h1> : <img src={s.displayImg} alt="" className="rounded-full"/>}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={5}>
                            {s.name}
                          </TooltipContent>
                        </Tooltip>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>}
            

              {servers.length > 0 ? <SidebarSeparator className="mx-0 my-1"/> : "" }

              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu className="items-center justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuItem>
                          <SidebarMenuButton variant={"blue"} className="h-12 w-12">
                            <AddServerButton />
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={5}>
                        Add Server
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </OverlayScrollbarsComponent>
        </Sidebar>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default OuterSidebar;
