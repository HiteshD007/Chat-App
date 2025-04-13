import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { socket } from "@/lib/socket";
import { friendInterface, requestInterface } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFriendStore, useOnlineUserStore, useRequestStore } from "@/store/zustand.store";
import { MessageCircle, Search, Trash } from "lucide-react";
import { Fragment, useEffect, useState } from "react";



const Friends = () => {

  const { requests } = useRequestStore();
  const { friends } = useFriendStore();
  const { onlineUsers } = useOnlineUserStore();
  
  const [addedFriends, setAddedFriends] = useState<friendInterface[]>(friends);
  // const [searchAddedFriend, setSearchAddedFriend] = useState<string>("");
  
  useEffect(() => {
    setAddedFriends(friends);
  },[friends])

  const handleDeclineRequest = (request:requestInterface) => {
    socket.emit('decline_friend_request',{requestId: request._id});
  }

  const handleAcceptRequest = (request:requestInterface) => {
    socket.emit('accept_friend_request',{requestId: request._id});
  }

  const removeFriend = (friend:friendInterface) => {
    socket.emit('remove_friend',{friendId:friend._id});
    setAddedFriends((friends) => friends.filter((f) => f._id !== friend._id));
  }

  return (
    <>      

      
      <Label className="h-12 dark:bg-input/60 bg-transparent border-input px-4 rounded-md">
        <Input className="text-lg text-white/80 dark:bg-transparent focus-visible:outline-0 focus-visible:ring-0 border-0" placeholder="search"/>
        <span className="hover:bg-black rounded-full p-2">
          <Search />
        </span>
      </Label>

      {requests.length > 0 && requests.map((r) => (
        <div key={r._id} className="my-4 flex items-center hover:bg-accent p-3 rounded-md">
          <Avatar className="border-2 border-green-400 h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png"/>
          </Avatar>
          <div className="mx-2">
            <h1 className="text-lg leading-4">{r.sender.username}</h1>
          </div>
          <div className="ml-auto flex items-center gap-x-4">
            <Button variant={"destructive"}
              onClick={() => handleDeclineRequest(r)}
            >Decline</Button>
            <Button variant={"blue"}
              onClick={() => handleAcceptRequest(r)}
            >Accept</Button>
          </div>
        </div>
      ))}

      {addedFriends.length === 0 && requests.length === 0 ? (
        <div className="my-4 w-full">
          <h1 className="text-center text-lg">No friends yet? Start adding and make some magic happen! ✨</h1>
          <p className="text-center text-blue-500/60 my-4 cursor-pointer">add friend</p>
        </div>
      ):(
        <>
          <h1 className="text-base font-light text-white/80 mt-4">All friends - {addedFriends.length}</h1>
          <Separator className="my-2"/>
        </>
      )}
      
      <div className="my-2">
        {addedFriends.length > 0 && addedFriends.map((f:friendInterface) => (
          <Fragment key={f._id}>
            <div className="flex items-center hover:bg-accent p-3 rounded-md">
              <Avatar className={cn(`h-10 w-10`,onlineUsers.includes(f._id) ? "border-2 border-green-500" : "border-2 border-slate-500")}>
                <AvatarImage src="https://github.com/shadcn.png"/>
              </Avatar>
              <div className="mx-2">
                <h1 className="text-lg leading-4">{f.username}</h1>
                <p className="text-sm">{onlineUsers.includes(f._id) ? "online" : "offline"}</p>
              </div>

              <div className="ml-auto flex items-center gap-x-2">
                <span className="hover:bg-black rounded-full p-2">
                  <MessageCircle />
                </span>
                <span className="hover:bg-black rounded-full p-2"
                  onClick={() => removeFriend(f)}
                >
                  <Trash />
                </span>
              </div>
            </div>
            <Separator className="my-2"/>
          </Fragment>
        ))}
      </div>
    </>
  );
};

export default Friends;
