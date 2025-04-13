import { useAuthStore, useOnlineUserStore } from "@/store/zustand.store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { LogOut } from "lucide-react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";



const UserCard = () => {

  const { user, accessToken } = useAuthStore();
  const { onlineUsers } = useOnlineUserStore();

  const handleLogout = async() => {
    try {
      const res = await fetch('/api/auth/log-out',{
        method: "POST",
        credentials: "include",
        headers: {
          authorization : `Bearer ${accessToken}`
        }
      });
      const data = await res.json();
      if(data?.success){
        socket.emit('logout');
        return;
      }
      throw new Error('failed to logout!!');
    } catch (error:any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="h-18 border-2 bg-accent w-full absolute bottom-0 left-0 rounded-md">
      <div className="flex items-center h-full mx-4 gap-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/shadcn.png"/>
        </Avatar>
        <div> 
          <h1>{user?.username}</h1>
          <div>{onlineUsers.includes(user?._id!) 
            ? <span className="flex items-center gap-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"/>
                online
              </span>
            : <span>
                <div className="h-2 w-2 bg-gray-500 rounded-full"/>
                offline
              </span>
            }
          </div>
        </div>
        <span className="ml-auto hover:bg-black p-3 rounded-full" onClick={handleLogout}>
          <LogOut />
        </span>
      </div>
    </div>
  );
};

export default UserCard;
