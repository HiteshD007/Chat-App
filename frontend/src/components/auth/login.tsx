import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
} from '../ui/card'

import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import { loginFormSchema } from '@/lib/form-schema';
import { 
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
 } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Loader from '../loader';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/zustand.store';
import { socket } from '@/lib/socket';
import useFetch from '@/hooks/use-fetch';
import { useState } from 'react';


const Login = () => {

  const { request } = useFetch();


  const { setAccessToken } = useAuthStore();
  const [isLoading , setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues:{
      auth: "",
      password: ""
    }
  });

  const onSubmit = async (values:z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    try {
      const data = await request({
        url: "/api/auth/log-in",
        method: "POST",
        data: {identifier: values.auth, password: values.password}
      });
      
      if(data?.error) {
        toast.error(data?.message,{
          duration: 1000
        });
      }else if(data?.success){
        setAccessToken(data.accessToken);
        socket.auth = { token : data.accessToken};
        socket.connect(); 
        form.reset({
          auth: "",
          password:""
        });
      }else{
        throw new Error('Unexpected Event occurring');
      }
    } catch (error) {
      console.log(error);
      toast.error("something went wrong!!");
    }finally{
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Login to use awesome chatting features.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField 
            control={form.control}
            name='auth'
            render={({field}) => (
              <FormItem>
                <FormLabel>
                  Username or Email
                </FormLabel>
                <FormControl>
                  <Input type='text' placeholder='username or email' {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField 
            control={form.control}
            name='password'
            render={({field}) => (
              <FormItem>
                <FormLabel>
                  Password
                </FormLabel>
                <FormControl>
                  <Input type='password' placeholder='password' {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <Button disabled={isLoading} className="w-full [&_svg:not([class*='size-'])]:size-6" variant="blue">
              {isLoading ? <Loader hideText/> : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Login;
