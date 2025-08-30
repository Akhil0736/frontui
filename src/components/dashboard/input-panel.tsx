
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function InputPanel() {
  return (
    <div className="w-[560px] h-[52px] rounded-2xl bg-white/[0.08] border border-white/20 backdrop-blur-[40px] shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex items-center justify-between p-2 pl-4">
      <Input
        type="text"
        placeholder="What can I help you with?"
        className="bg-transparent border-none text-white/80 placeholder:text-white/35 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
      />
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-lg bg-black/60 border border-white/10 hover:bg-black/80"
      >
        <Send className="h-4 w-4 text-white" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
