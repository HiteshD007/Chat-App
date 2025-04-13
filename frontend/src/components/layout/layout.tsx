import { useState } from "react";
import OuterSidebar from "./outer-sidebar";
import InnerSidebar from "./inner-sidebar";
import MessageSpace from "./message-space";
import DMLayout from "./DM/dm-layout";

import { useChatStore } from "@/store/zustand.store";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"; 
import MobileInnerSidebar from "./mobile-inner-sidebar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import MobileTopBar from "./mobile-top-bar";
import TopBar from "./top-bar";
import UserCard from "../user-card";



const Layout = () => {

  const { chat } = useChatStore();

  const [isAddingFriend, setIsAddingFriend] = useState<boolean>(false);

  const handleIsAddingFriend = (value:boolean) => {
    setIsAddingFriend(value);
  }

  const [sheetOpen, setSheetOpen] = useState<boolean>(false)

  const openSheet = () =>{
    setSheetOpen(true);
  }


  return (

    <>
      <div className="relative hidden md:flex">
        <div className="flex relative">
          <OuterSidebar />
          <InnerSidebar />
          <UserCard />
        </div>
        <div className="w-full relative">
          <TopBar handleIsAddingFriend={handleIsAddingFriend}/>
          {chat ? <MessageSpace />: <DMLayout isAddingFriend={isAddingFriend}/>}
        </div>
      </div>



      <div className="relative flex md:hidden flex-row justify-start items-start">
        <OuterSidebar isMobile={true} openSheet={openSheet}/>
        <MobileInnerSidebar openSheet={openSheet}/>
        <Sheet open={sheetOpen} onOpenChange={(open) => setSheetOpen(open)}>
          <VisuallyHidden>
            <SheetHeader>
                <SheetTitle>Space</SheetTitle>
                <SheetDescription>Message space of mobile </SheetDescription>
            </SheetHeader>
          </VisuallyHidden>
          <SheetContent className="w-svw !max-w-svw gap-0">
            <MobileTopBar handleIsAddingFriend={handleIsAddingFriend}/>
            {chat ? <MessageSpace />: <DMLayout isAddingFriend={isAddingFriend}/>}
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
};

export default Layout;
