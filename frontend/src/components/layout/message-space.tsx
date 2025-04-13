import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Download, PlusCircle, Send, Smile, XCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useAuthStore, useMessageStore } from "@/store/zustand.store";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { socket, uploadFiles } from "@/lib/socket";


const MessageSpace = () => {

  const { user, roomId } = useAuthStore();
  const { messages } = useMessageStore();

  const [files,setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setFiles((prev) => prev ? [...prev, ...files] : files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrl(prev => [...prev, ...urls]);
  }

  const removeFile = (id:number) => {
    setFiles(prev => prev.filter((_,index) => index !== id));
    setPreviewUrl(prev => prev.filter((_,index) => index !== id));
  }

  const onUploadFile = () => {
    document.getElementById('file-upload')?.click();
  }

  const onEmojiClick = (emoji:EmojiClickData) => {
    setContent((prev) => prev +  emoji.emoji);
  }

  const onContentChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }

  const onSendMessage = async() => {
    if(files.length === 0 && content.trim() === "") {
      setContent("");
      toast.error('cannot send empty message',{duration:800});
      return;
    }
    if(files.length === 0 && content !== ""){
      socket.emit('send_message',{
        content,
        senderId: user?._id,
        roomId,
      });
    }
    if(files.length > 0){
      uploadFiles(files,{roomId, content, senderId: user?._id});
    }
    
    setContent("");
    setFiles([]);
    setPreviewUrl([]);
  }

  return (
      <div className="pt-2 min-h-[calc(100svh-56px)] max-h-[calc(100svh-56px)] flex flex-col justify-end">
        <OverlayScrollbarsComponent
          className='scrollbar'
          defer
          options={{
            scrollbars:{
              autoHide:"never",
              theme: "os-theme-light"
              }
            }}
        >
          <div>
            {messages.map((m,id) => (
              <div key={id} className="p-4 rounded-md flex flex-row items-start justify-start hover:bg-gray-600/40">
                <Avatar className="h-8 w-8 lg:h-12 lg:w-13">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="px-2 w-full">
                  <div className="flex items-center justify-start gap-x-4">
                    <h1 className="font-semibold text-sm lg:text-base">{m.sender.username}</h1>
                    <p className="font-light text-sm lg:text-small">{new Date(m.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    {m.messageType === "text" ? (
                      <p className="text-sm font-light max-w-[900px] whitespace-pre-wrap">
                        {m.content}
                      </p>
                    ): (m.messageType === "image" || m.messageType === "gif") ? (
                      <div className="m-2">
                        <img src={m.content} alt="" draggable={false} className="h-40 rounded-md select-none" />
                      </div>
                    ) : (m.messageType === "video") ? (
                      <div className="m-2">
                        <video src={m.content} controls draggable={false} className="h-40 rounded-md select-none" autoPlay={false}/>
                      </div>
                    ) : (m.messageType === "audio") ? (
                      <div className="m-2">
                        <audio src={m.content} controls draggable={false} className="h-40 rounded-md select-none"/>
                      </div>
                    ):(m.messageType === "pdf" || m.messageType === "txt") ? (
                      <div className="m-2 space-y-2">
                        <iframe src={m.content} title="pdf" draggable={false} className="w-[600px] h-40 rounded-md select-none"/>
                        <a title="download" className="flex gap-x-4" href={m.content} target="_blank">
                          <Download /> Download Pdf
                        </a>
                      </div>
                    ): (
                      <div className="h-50 w-50 bg-accent flex items-center justify-center flex-col rounded-md m-2">
                        <a title="download" href={m.content} target="_blank">
                          <Download size={50}/>
                        </a>
                        <p className="py-4">Download File</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </OverlayScrollbarsComponent>

        <div className="flex flex-col items-center justify-center bg-white/20">
          {previewUrl.length > 0 && 
            <OverlayScrollbarsComponent 
              defer className="w-full max-w-svw"
              options={{scrollbars: { autoHide:"scroll" }}}
            >
              <div className="w-full flex items-center justify-start mt-4 mb-2 gap-x-4 px-4">
                {previewUrl.map((url,id) => 
                  (files[id]?.type.startsWith('image/') ||  files[id]?.type === "text/html") ? (
                        <div key={id} className="relative">
                          <img src={url} alt="" draggable={false} className="h-40 rounded-md select-none" />
                            <XCircle 
                              onClick={() => removeFile(id)}
                              size={30} 
                              className="absolute -top-2 -right-2 hover:text-red-500"
                            />
                        </div>
                      ): files[id]?.type.startsWith('video/') ? (
                          <div key={id} className="relative">
                          <video src={url} controls draggable={false} className="h-40 rounded-md select-none"/>
                          <XCircle 
                            onClick={() => removeFile(id)}
                            size={30} 
                            className="absolute -top-2 -right-2 hover:text-red-500"
                          />
                        </div>
                      ): files[id]?.type.startsWith('audio/') ? (
                          <div key={id} className="relative">
                            <audio src={url} controls draggable={false} className="h-40 rounded-md select-none"/>
                            <XCircle 
                              onClick={() => removeFile(id)}
                              size={30} 
                              className="absolute -top-2 -right-2 hover:text-red-500"
                            />
                        </div>
                      ): (files[id]?.type === "application/pdf" || files[id]?.type === "text/plain") ? (
                          <div key={id} className="relative">
                            <iframe src={url} title="pdf" draggable={false} className="h-40 rounded-md select-none"/>
                            <XCircle 
                              onClick={() => removeFile(id)}
                              size={30} 
                              className="absolute -top-2 -right-2 hover:text-red-500"
                            />
                          </div>
                      ): (
                        <div key={id} className="relative">
                          <Button>
                            <a href={url} target="_blank">
                              {`Preview ${files[id]?.name}`}
                            </a>
                          </Button>
                          <XCircle 
                            onClick={() => removeFile(id)}
                            size={30} 
                            className="absolute -top-2 -right-2 hover:text-red-500"
                          />
                        </div>
                      ))}
              </div>  
            </OverlayScrollbarsComponent>
          }
                

          <div className="flex items-center justify-center w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger onClick={onUploadFile} className="mx-2 lg:mx-4">
                  <PlusCircle size={30}/>
                  <input 
                    type="file" 
                    id="file-upload" 
                    placeholder="file-upload" 
                    title="file-upload" 
                    className="hidden"
                    onChange={(e) =>  handleFileChange(e)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-base">upload media</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Textarea
            value={content}
            onChange={(e) => onContentChange(e)}
            rows={3} 
            className="resize-none w-9/10 my-3 focus-visible:ring-0 focus-visible:border-0 !bg-black/70"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="mx-2 lg:mx-4">
                  <Send size={30} onClick={onSendMessage}/>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-base">send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger className="mx-2 lg:mx-4">
                <Smile size={30}/>
              </PopoverTrigger>
              <PopoverContent side="top" sideOffset={20} className="w-full p-0">
                <EmojiPicker 
                  open={true}
                  onEmojiClick={(emoji) => onEmojiClick(emoji)}
                  emojiStyle={EmojiStyle.APPLE} 
                  searchPlaceHolder="smile"
                />
              </PopoverContent>
            </Popover>

          </div>

        </div>
      </div>
  )
};

export default MessageSpace;