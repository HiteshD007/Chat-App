import { useEffect, createContext, useContext } from "react";
import useFetch from "@/hooks/use-fetch";
import { socket } from "@/lib/socket";
import Loader from "@/components/loader";
import { useAuthStore, useLoadingStore  } from "@/store/zustand.store";

const authContext = createContext(null);
  
export const AuthProvider = ({
  children
}:{children:React.ReactNode}) => {

  const { setAccessToken }  = useAuthStore();
  const { isLoading, setIsLoading } = useLoadingStore();

  const { request } = useFetch();

  const getAccessToken = async () => {
    const data = await request({
      url: '/api/auth/get/access-token'
    });
    if(data?.accessToken){
      setAccessToken(data.accessToken);
      return data.accessToken;
    }
    if(data?.logoutUser){
      return null;
    }
  }
  
  const autoSignIn = async () => {
    const token = await getAccessToken();
    if(token === null) {
      setIsLoading(false);
      return;
    }
    const data = await request({
      url: '/api/auth/auto-sign-in',
      token
    });
    if(!data?.success) return;
    socket.auth = { token };
    socket.connect();
  }


  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await autoSignIn();
    }
    initializeAuth();
    return (() => {
      socket.disconnect();
    })
  },[]);


  return (
    <authContext.Provider 
      value={null}
    >
      {isLoading ? <Loader /> : children}
    </authContext.Provider>
  )
};

export const useAuth = () => {
  const context = useContext(authContext);
  if(!context) throw new Error("useSession() must be used within AuthContext");
  return context;
}
