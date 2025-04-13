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
import { toast } from 'sonner';
import { useLoadingStore, useAuthStore } from '@/store/zustand.store';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '@/lib/socket';
import useFetch from '@/hooks/use-fetch';


const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { request } = useFetch();


  const { setAccessToken } = useAuthStore();
  const { setIsLoading } = useLoadingStore();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues:{
      auth: "",
      password: ""
    }
  });

  const onSubmit = async (values:z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    const data = await request({
      url: "/api/auth/log-in",
      method: "POST",
      data: {identifier: values.auth, password: values.password}
    });
    if(data.error) {
      toast.error(data.message,{
        duration: 1000
      });
      return;
    };
    setAccessToken(data.accessToken);

    socket.auth = { token : data.accessToken};
    socket.connect(); 

    form.reset({
      auth: "",
      password:""
    });
    setIsLoading(false);
    const redirectTo = location.state?.from || "/";
    navigate(redirectTo);
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
            <Button className='w-full' variant="blue">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Login;
