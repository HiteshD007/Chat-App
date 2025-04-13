import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
} from '../ui/card';

import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import { RegisterFormSchema } from '@/lib/form-schema';
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
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/zustand.store';
import { socket } from '@/lib/socket';

const Register = () => {

  const { request } = useFetch();
  const { setAccessToken } = useAuthStore();

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues:{
      username: "",
      email: "",
      password: "",
      confirm: "",
    }
  });

  const onSubmit = async ({username, email, password, confirm}:z.infer<typeof RegisterFormSchema>) => {
    form.reset({
      username: "",
      email:"",
      password:"",
      confirm:""
    });
    const data = await request({
      url: '/api/auth/sign-up',
      method: "POST",
      data: { username, email, password, confirm }
    });

    console.log(data);

    if(data?.error){
      toast.error(data?.message,{
        duration: 1000
      });
      return;
    }
    if(data?.success){
      setAccessToken(data?.accessToken);
      socket.auth = { token : data?.accessToken};
      socket.connect();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Register to connect with persons around the world.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField 
            control={form.control}
            name='username'
            render={({field}) => (
              <FormItem>
                <FormLabel>
                  Username
                </FormLabel>
                <FormControl>
                  <Input type='text' placeholder='username' {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField 
            control={form.control}
            name='email'
            render={({field}) => (
              <FormItem>
                <FormLabel>
                  Email
                </FormLabel>
                <FormControl>
                  <Input type='text' placeholder='email' {...field}/>
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
            <FormField 
            control={form.control}
            name='confirm'
            render={({field}) => (
              <FormItem>
                <FormLabel>
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input type='password' placeholder='confirm password' {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <Button className='w-full' variant="blue">
              Register
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
};

export default Register;
