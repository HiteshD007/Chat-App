import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "./ui/dialog";
import { 
  Form, 
  FormField, 
  FormControl, 
  FormLabel, 
  FormMessage, 
  FormItem 
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serverFormSchema } from "@/lib/form-schema";



import { socket } from "@/lib/socket";

const AddServerButton = () => {

const [open, setOpen] =  useState<boolean>(false);

const form = useForm<z.infer<typeof serverFormSchema>>({
  resolver: zodResolver(serverFormSchema),
  defaultValues: {
    serverName: ""
  }
});

const onSubmit = async (values:z.infer<typeof serverFormSchema>) => {
  setOpen(false);
  form.reset({
    serverName: ""
  });
  const data = {serverName: values.serverName, displayImg: ""};
  socket.emit('create_server',data);
}

const onOpenChange = (value:boolean) => {
  setOpen(value)
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <PlusCircle size={35}/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Server</DialogTitle>
          <DialogDescription>Create your own & Invite friends and have fun.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField 
            control={form.control}
            name='serverName'
            render={({field}) => (
              <FormItem>
                <FormLabel>
                  Server Name
                </FormLabel>
                <FormControl>
                  <Input type='text' placeholder='server name' {...field} className="focus-visible:ring-0 focus-visible:border-0"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <Button className="w-full" variant="blue">Create Server</Button>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  );
};

export default AddServerButton;
