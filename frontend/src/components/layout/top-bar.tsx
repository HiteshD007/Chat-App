import { Menubar, MenubarContent, MenubarGroup, MenubarLabel, MenubarMenu, MenubarTrigger } from "../ui/menubar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BellIcon, Dot, Hash, Users } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Friends from "../icons/friends";

import { useChatStore, useOnlineUserStore, useServerStore } from "@/store/zustand.store";

const TopBar = ({handleIsAddingFriend}:{handleIsAddingFriend:(value:boolean) => void}) => {

  const { onlineUsers } = useOnlineUserStore();
  const { selectedServer } = useServerStore();
  const { chat } = useChatStore();
  const members = chat?.participants ?? [];

  return (
    <Menubar className="h-14 p-2 w-full bg-black/0 backdrop-blur-[20px] rounded-none flex flex-row items-center justify-between border-0 border-b-2">
      <MenubarMenu>
        {selectedServer === null && (
          <MenubarGroup className="flex">
            <MenubarLabel className="flex gap-x-3 p-4">
              <Friends/>
              <p className="text-base text-white/70">
                Friends
              </p>
              <Dot />
            </MenubarLabel>
            <div className="flex items-center gap-x-2">
              <Button variant={"ghost"} className="text-base" onClick={() => handleIsAddingFriend(false)}>
                All friends
              </Button>
              <Button variant={"blue"} onClick={() => handleIsAddingFriend(true)}>
                Add Friends
              </Button>
            </div>
          </MenubarGroup>
        )}

        {selectedServer && (
          <MenubarLabel className="flex flex-row items-center justify-center gap-x-2">
            {chat?.profilePic === undefined ?
              <Hash size={25}/>
            :<Avatar className="border-2 border-green-400 h-10 w-10">
                <AvatarImage src="https://github.com/shadcn.png"/>
              </Avatar>
            }
            <p className="text-balance">
              {chat?.name}
            </p>
          </MenubarLabel>
        )}

      </MenubarMenu>
      

      <MenubarGroup className="flex flex-row items-center justify-center gap-x-2 ml-auto">
        <MenubarMenu>
          <MenubarTrigger>
            <BellIcon />
          </MenubarTrigger>
          <MenubarContent side="left" sideOffset={10} alignOffset={20} className="w-[500px] h-[400px]">
            {/* Notification HERE */}
          </MenubarContent>
        </MenubarMenu>
  
        {selectedServer && (
          <MenubarMenu>
            <MenubarTrigger>
              <Users />
            </MenubarTrigger>

            <MenubarContent sideOffset={10} alignOffset={20} className="w-[250px] h-full">
              <OverlayScrollbarsComponent 
                className='scrollbar max-h-[calc(100svh-124px)]'
                defer
                options={{
                  scrollbars:{
                    autoHide:"never",
                    theme: "os-theme-light"
                    }
                  }}
              >
                {members.map((m) => (
                  <div key={m._id} className="rounded-md flex flex-row items-center justify-start hover:bg-gray-600/40 p-2 gap-x-2">
                    <Avatar className={cn(`h-10 w-10`,onlineUsers.includes(m._id) ? "border-2 border-green-500" : "border-2 border-slate-500")}>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <h1>{m.username}</h1>
                  </div>
                ))}
              </OverlayScrollbarsComponent>
            </MenubarContent>
          </MenubarMenu>
        )}
      </MenubarGroup>
    </Menubar>
  );
};

export default TopBar;
