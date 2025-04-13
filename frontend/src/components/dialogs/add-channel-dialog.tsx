import z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { channelFormSchema } from '@/lib/form-schema';

import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
 } from '../ui/form';
import { Label } from '../ui/label';
import { Hash, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

import { Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogClose,
 } from "../ui/dialog";
import { useEffect, useState } from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { friendInterface } from '@/lib/types';
import { socket } from '@/lib/socket';
import { useServerStore } from '@/store/zustand.store';

interface AddChannelDialogProps{
  open: boolean,
  onOpenChange: (open:boolean) => void,
  closeDialog: () => void,
}

const AddChannelDialog:React.FC<AddChannelDialogProps> = ({
  open,
  onOpenChange,
  closeDialog,
}) => {

  const form = useForm<z.infer<typeof channelFormSchema>>({
    resolver: zodResolver(channelFormSchema),
    defaultValues:{
      channelName: "",
      type: "text",
      isPrivate: false,
    }
  });

  const { selectedServer } = useServerStore();
  const [allMembers, setAllMembers] = useState<friendInterface[] | []>([]);

  useEffect(() => {
    if(selectedServer) setAllMembers(selectedServer.members);
  },[selectedServer])

  const [permittedUsers, setPermittedUsers] = useState<string[]>([]);
  const [memberDialogOpen, setMemberDialogOpen] = useState<boolean>(false);

  const permitUser = (userId:string) => {
    if(permittedUsers.includes(userId)){
      setPermittedUsers(prev => prev.filter((id) => id !== userId));
    }else{
      setPermittedUsers(prev =>  [...prev, userId]);
    }
  }
  
  const onSubmit = async(values:z.infer<typeof channelFormSchema>) => {
    closeDialog();
    setMemberDialogOpen(false);
    const data ={
      serverId: selectedServer?._id, 
      channelName: values.channelName, 
      type:values.type, 
      isPrivate:values.isPrivate,
      permittedUsers
    }
    socket.emit('create_channel',data);
    form.reset({
      channelName: "",
      type: "text",
      isPrivate: false
    });
    setPermittedUsers([]);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[600px] sm:max-w-full">
          <DialogHeader>
            <DialogTitle> Create Channel </DialogTitle>
            <DialogDescription>
              add a new channel to your server.
            </DialogDescription>
          </DialogHeader>
            <Form {...form}>
              <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField 
                  control={form.control}
                  name='type'
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Channel Type</FormLabel>
                      <FormControl>
                        <RadioGroup {...field} onValueChange={field.onChange}>
                          <Label className="h-16 hover:bg-accent p-4 gap-x-4 rounded-md">
                            <RadioGroupItem value="text" className="w-8 h-8" />
                            <div className='flex items-center justify-start gap-x-2'>
                              <Hash size={35} color="gray"/>
                              <div className="flex flex-col items-start justify-start">
                                <h2 className="text-lg">Text</h2>
                                <p className="text-sm tracking-wide font-light">send message, images, GIFs, Emojis, opinions</p>
                              </div>
                            </div>
                          </Label>
                    
                          <Label className="h-16 hover:bg-accent p-4 gap-x-4 rounded-md" 
                            onClick={() => toast.error('voice channel service not available yet!!!',{
                              duration: 1000
                            })}
                          >
                            <RadioGroupItem value="voice" className="w-8 h-8" disabled/>
                            <div className='flex items-center justify-start gap-x-2'>
                              <Hash size={35} color="gray"/>
                              <div className="flex flex-col items-start justify-start">
                                <h2 className="text-lg">Voice</h2>
                                <p className="text-sm tracking-wide font-light">Hang out together with voice, video and screen share</p>
                              </div>
                            </div>
                          </Label>

                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField 
                  control={form.control}
                  name='channelName'
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Channel Name</FormLabel>
                      <FormControl>
                        <Input placeholder='channel name' {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField 
                  control={form.control}
                  name='isPrivate'
                  render={({field}) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className='flex items-center justify-start gap-x-2'>
                              <Lock />
                              <h2>Private Channel</h2>
                            </div>
                            <Checkbox className='h-5 w-5' checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)}/>
                          </div>
                          <p className="text-sm ">
                            Only selected members and roles will be able to view this channel.
                          </p>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-x-4 flex items-center justify-end">
                  <DialogClose asChild>
                    <Button type='button' variant="destructive">
                      Cancel
                    </Button>
                  </DialogClose>
                  {form.watch('isPrivate') ? (
                    <Button type='button' variant="blue" onClick={() => setMemberDialogOpen(true)}>
                      Next
                    </Button>
                  ):(
                    <Button variant="blue">
                      Create
                    </Button>
                  )}
                </div>
              </form>
            </Form>
        </DialogContent>
      </Dialog>


      <Dialog open={memberDialogOpen} onOpenChange={(open) => setMemberDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Members</DialogTitle>
            <DialogDescription>Grant permission to view this channel</DialogDescription>
          </DialogHeader>
          <div>
            <Input placeholder='search member' className='focus-visible:outline-none focus-visible:ring-0 p-4 h-12'/>

            <div className='my-4'>
              {allMembers?.map((m) => (
                <Label key={m._id} className='h-14 bg-accent px-4 rounded-md flex items-center justify-between'>
                  <span className='flex items-center justify-center gap-x-3'>
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                    </Avatar>
                    {m.username}
                  </span>
                  <Checkbox className='h-8 w-8'
                    checked={permittedUsers.includes(m._id)}
                    onCheckedChange={() => permitUser(m._id)}
                  />
                </Label>
              ))}
            </div>

            <div className="space-x-4 flex items-center justify-end">
              <DialogClose asChild>
                <Button type='button' variant="destructive">
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="blue" onClick={form.handleSubmit(onSubmit)}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
};

export default AddChannelDialog;
