import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useServerStore } from "@/store/zustand.store";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useState } from "react";


const ServerSettings = () => {

  const { selectedServer } = useServerStore();

  const serverProfile = true;
  // const members = false;

  const [banner, setBanner] = useState("black");
  const banners = ['black','volcano','soul','marsh','thunder','rising','zephyr','earth','boulder','cascade'];

  return (
    <>
      <OverlayScrollbarsComponent
        defer
        className="max-h-svh min-h-svh"
        options={{scrollbars:{autoHide:"scroll"}}}
      >
        {serverProfile && (
          <TooltipProvider>
            <div className="flex justify-start w-[1200px]">
              <div className="py-8 px-10 lg:w-[400px] xl:w-[600px] wide:w-[800px]">
                <h1 className="text-xl font-semibold">Server Profile</h1>
                <p className="text-sm font-light text-gray-300 py-2">Customize how your server appears in invite links,server discovery and announcement channels.</p>

                <div className="mt-8">
                  <Label className="flex flex-col items-start justify-center gap-y-2">
                    <h1 className="text-base font-semibold">Name</h1>
                    <Input className="focus-visible:ring-0" placeholder="server name"/>
                  </Label>
                </div>

                <Separator className="my-8"/>

                <Label className="flex flex-col items-start justify-center gap-y-2">
                  <h1 className="text-base font-semibold">Icon</h1>
                  <p className="text-sm font-light text-gray-300">recommender image size: 512 x 512</p>
                  <Button variant="blue">
                    Change Server Icon
                  </Button>
                </Label>

                <Separator className="my-8"/>

                <div className="flex flex-col items-start justify-center gap-y-2">
                  <h1 className="text-base font-semibold">Banner</h1>
                  <p className="text-sm font-light text-gray-300">choose banner from below or custom banner image.</p>
                  <div className="grid grid-cols-[repeat(auto-fit,120px)] max-w-full gap-2">
                    {banners.map((b) => (
                      <Tooltip key={b}>
                        <TooltipTrigger>
                          <div className={cn('w-30 h-15 flex items-center justify-center rounded-md shadow shadow-white hover:border-blue-500 hover:border-2 cursor-pointer', b===banner ? "border-blue-500 border-2" : "")}
                            onClick={() => setBanner(b)}
                          style={{background:`var(--${b})`}}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="text-base">
                          {b}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  <p className="text-sm font-light text-gray-300 mt-4">recommender image size: 512 x 512</p>
                  <Button variant="blue" className="mb-4">
                    Change Server Banner
                  </Button>
                </div>

                <Separator className="my-8"/>

                <div className="mt-8 pb-20">
                  <Label className="flex flex-col items-start justify-center gap-y-2">
                    <h1 className="text-base font-semibold">Description</h1>
                    <p className="text-sm font-light text-gray-300">How did you get your server started? Why should people join?</p>
                    <Textarea rows={3} className="resize-none h-20 scrollbar relative"/>
                  </Label>
                </div>
              </div>

              <div className="max-h-svh min-h-svh">
                <Card className="w-[330px] p-0 overflow-hidden fixed">
                  <CardContent className="h-full p-0">
                    <div className={`h-[130px] w-full`} 
                    style={{background:`var(--${banner})`}}
                    />
                    <div className="h-full relative bg-gray-500/35 p-5">
                      <div className="h-16 w-16 bg-black flex items-center justify-center rounded-xl absolute -top-8 left-10 border-4 border-gray-500/35">
                        {selectedServer?.displayImg === "" ? 
                          <h1 className="!text-xl font-normal">
                            {selectedServer?.name.charAt(0).toUpperCase()}
                          </h1> : <img src={selectedServer?.displayImg} alt="" className="rounded-full"/>
                        }
                      </div>

                      <div className="pt-6 overflow-hidden">
                        <h1 className="text-sm font-bold">{selectedServer?.name}</h1>
                        <div className="flex items-center justify-start gap-x-3">
                          <div className="flex items-center justify-center gap-x-1">
                            <div className="bg-gray-300 h-2 w-2 rounded-full"/>
                            <span className="text-small">
                              {selectedServer?.members.length} Members
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-x-1">
                            <div className="bg-green-400 h-2 w-2 rounded-full"/>
                            <span className="text-small">
                              {selectedServer?.members.length} Online
                            </span>
                          </div>
                        </div>
                        <p className="text-small font-light">Est. March 2025</p>

                        <p className="pt-5 text-small font-light text-ellipsis">Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita, nam.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </TooltipProvider>
        )}

      </OverlayScrollbarsComponent>
    
    
    </>
  );
};

export default ServerSettings;
