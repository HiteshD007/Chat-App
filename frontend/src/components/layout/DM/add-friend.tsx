import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { socket } from "@/lib/socket";
import { friendInterface } from "@/lib/types";
import { useAuthStore, useFriendStore } from "@/store/zustand.store";
import { Search } from "lucide-react";
import React, { useState } from "react";

const AddFriend = () => {

  const { user } = useAuthStore();
  const { friends } = useFriendStore();

  const [alreadyFriend, setAlreadyFriend] = useState<boolean>(false);
  const [searchFriend , setSearchFriend] = useState<string>("");
  const [searchedFriend, setSearchedFriend] = useState<friendInterface | null>(null);

  const handleAddFriend = () => {
    socket.emit("search_friend",{username:searchFriend});
  }

  socket.on('requested_friend',({friend}) => {
    if(!friend) setSearchedFriend(null);
    else {
      setAlreadyFriend(friends.some((f) => f._id === friend?._id));
      setSearchedFriend(friend);
    }
  });

  const handleSearchFriendChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setSearchFriend(e.target.value);
    setSearchedFriend(null);
  }

  const handleSendFriendRequest = () => {
    socket.emit('send_friend_request',{to: searchedFriend?._id});
  }


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl">Add Friend</h1>
          <p className="text-base text-white/80 my-2">you can add friends with their username.</p>
        </div>
        <img src="/add-friend.svg" alt="" className="pr-12"/>
      </div>
      <Label className="h-16 dark:bg-input/60 bg-transparent border-1 border-blue-500/60 px-2 rounded-md">
        <Input className="text-lg text-white/80 dark:bg-transparent focus-visible:outline-0 focus-visible:ring-0 border-0" placeholder="search"
        value={searchFriend}
        onChange={(e) => handleSearchFriendChange(e)}
        />
        <span className="hover:bg-black rounded-full p-2" onClick={handleAddFriend}>
          <Search />
        </span>
      </Label>

      {searchedFriend && (
        <div className="my-2">
          <div className="flex items-center hover:bg-accent p-3 rounded-md">
              <Avatar className="border-2 border-green-400 h-10 w-10">
                <AvatarImage src="https://github.com/shadcn.png"/>
              </Avatar>
              <div className="mx-2">
                <h1 className="text-lg leading-4">{searchedFriend.username}</h1>
              </div>
              {(user?._id !== searchedFriend._id && !alreadyFriend) && (
                <Button variant={"blue"} className="ml-auto" onClick={handleSendFriendRequest}>
                  Send Request
                </Button>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default AddFriend;
