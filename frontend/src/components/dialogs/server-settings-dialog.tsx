import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import ServerSettingSidebar from "./settings/server-setting-sidebar";
import ServerSettings from "./settings/server-settings";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


interface ServerSettingsDialogProps{
  open: boolean,
  onOpenChange: (open:boolean) => void,
  closeDialog: () => void,
}




const ServerSettingsDialog:React.FC<ServerSettingsDialogProps> = ({
  open,
  onOpenChange,
  closeDialog
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>change server settings</DialogDescription>
      </VisuallyHidden>
      <DialogContent onEscapeKeyDown={closeDialog} className="sm:max-w-full w-svw h-svh">
        <div className="h-full w-full flex items-center xl:justify-end xl:px-8">
          <ServerSettingSidebar />
          <ServerSettings />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServerSettingsDialog;
