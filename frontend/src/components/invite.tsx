
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore, useServerStore } from "@/store/zustand.store";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import Loader from "./loader";

const Invite = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useAuthStore();
  const { setSelectedServer } = useServerStore();
  const { token } = useParams();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [server, setServer] = useState<{
    _id:string, 
    name:string,
    displayImg:string,
    bannerImg:string}|null>(null);

  useEffect(() => {
    if(!isAuthenticated) navigate("/login",{state: {from: location.pathname}});
    socket.emit('verify_invite_link', {inviteToken:token});
    setIsLoading(true);
    return () => { setIsLoading(false) }
  },[]);

  socket.on('server_not_found',({message}) => {
    setIsLoading(false);
    toast.error(message,{
      duration: 1000
    })
  });
  socket.on('invalid_invite',({message}) => {
    setIsLoading(false);
    toast.error(message,{
      duration: 1000
    })
  });
  socket.on('invite_verified',({server, alreadyJoined}) => {
    setIsLoading(false);
    if(alreadyJoined){
      setSelectedServer(server);
      toast.success('you are already member of this server');
      navigate('/');
    }else{
      if(server.bannerImg === "") server.bannerImg = "zephyr";
      setServer(server);
    }
  });


  const onAcceptInvite = async() => {
    socket.emit('accept_invite',{serverId: server?._id});
    navigate('/');
  }


  if(isLoading || !server)  return(
    <Loader />
  );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-[330px] p-0 overflow-hidden">
        <CardContent className="h-full p-0">
          <div className={`h-[130px] w-full`} 
            style={{background:`var(--${server.bannerImg})`}}
          />
          <div className="h-full relative bg-gray-500/35 p-5">
            <div className="h-16 w-16 bg-black flex items-center justify-center rounded-xl absolute -top-8 left-10 border-4 border-gray-500/35">
              {server?.displayImg === "" ? 
                <h1 className="!text-xl font-normal">
                  {server.name.charAt(0).toUpperCase()}
                </h1> : <img src={server?.displayImg} alt="" className="rounded-full"/>
              }
            </div>
            <h1 className="my-4 text-lg">Join Server: {server?.name}</h1>
            <Button variant={"blue"} className="w-full"
              onClick={onAcceptInvite}
            >
              Accept Invite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
