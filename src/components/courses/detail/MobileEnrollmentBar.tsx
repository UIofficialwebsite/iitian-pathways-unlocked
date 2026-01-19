import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import EnrollmentCard from "./EnrollmentCard"; // Adjust import based on your file structure

// Define an interface for the props if you know them, or use 'any' for now to pass them through
interface MobileEnrollmentBarProps {
  [key: string]: any; // This allows passing all props down to EnrollmentCard
}

export function MobileEnrollmentBar(props: MobileEnrollmentBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button 
            className="w-full flex items-center justify-between h-12 text-lg shadow-lg" 
            size="lg"
          >
            <span className="font-semibold">Continue with Batch</span>
            <ChevronUp className="h-5 w-5 animate-bounce" />
          </Button>
        </DrawerTrigger>
        
        <DrawerContent className="h-[85vh] px-0">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle className="text-center">Batch Details</DrawerTitle>
          </DrawerHeader>
          
          <div className="overflow-y-auto px-4 py-6 pb-20">
            {/* We render the existing EnrollmentCard here */}
            {/* You might want to pass a 'className' prop to EnrollmentCard to remove shadow/border if needed */}
            <div className="flex justify-center">
               <EnrollmentCard {...props} className="w-full border-none shadow-none" />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
