import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import { Sidebar } from './sidebar';

export const MobileSidebar = () => {
    return (
        <Sheet>
            <SheetTrigger className='md:hidden rtl:pl-4 ltr:pr-4 hover:opacity-75 transition'>
                <Menu />
            </SheetTrigger>
            <SheetContent side='right' className='p-0 bg-card'>
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}