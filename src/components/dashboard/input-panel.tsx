import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function InputPanel() {
  return (
    <div className="w-[560px] h-[52px] rounded-2xl bg-gray-950/50 border border-primary/20 backdrop-blur-sm shadow-2xl shadow-primary/10 flex items-center justify-between p-2 pl-4">
      <Input
        type="text"
        placeholder="What can I help you with?"
        className="bg-transparent border-none text-white/80 placeholder:text-white/35 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
      />
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-lg bg-primary/50 border border-primary/30 hover:bg-primary/80 transition-colors"
      >
        <Send className="h-4 w-4 text-white" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
