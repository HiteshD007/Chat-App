import { 
  SidebarProvider,
  Sidebar,
  SidebarContent,
 } from "../../ui/sidebar";

 import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

const SettingSidebarLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <SidebarProvider style={{
      "--sidebar-width" : "15rem"
    }as React.CSSProperties}>
      <Sidebar collapsible="none" className="min-h-svh max-h-svh">
        <OverlayScrollbarsComponent 
          className='scrollbar'
          defer
          options={{scrollbars:{autoHide:"scroll"}}}
        >
          <SidebarContent>
            {children}
          </SidebarContent>
        </OverlayScrollbarsComponent>
      </Sidebar>
    </SidebarProvider>
  )
};

export default SettingSidebarLayout;
