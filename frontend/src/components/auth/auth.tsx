
import Login from "./login";
import Register from "./register";
import { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
 } from "../ui/tabs";
import { useEffect } from "react";
import { useAuthStore } from "@/store/zustand.store";
import { useLocation, useNavigate } from "react-router-dom";

const Auth = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const {isAuthenticated} = useAuthStore();

  useEffect(() => {
    if(isAuthenticated){
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo);
    };
  },[isAuthenticated]);


  return (
    <div className="h-full w-full flex items-center justify-center">
      <Tabs defaultValue="login" className="w-[500px]">
        <TabsList className="w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
          <TabsContent value="login">
            <Login />
          </TabsContent>

          <TabsContent value="register">
            <Register />
          </TabsContent>
      </Tabs>
    </div>
  )
};

export default Auth;
