import { Button } from "@/components/ui/button";
import { ScanLine } from "lucide-react";

export default function InputPanel() {
  return (
    <div className="w-[560px] h-[88px] rounded-2xl bg-white/[0.08] border border-white/20 backdrop-blur-[40px] shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex items-center justify-between p-3 pl-6">
      <p className="text-white/35 text-lg">What can I help you with?</p>
      <Button
        variant="ghost"
        size="icon"
        className="w-11 h-11 rounded-xl bg-black/60 border border-white/10 hover:bg-black/80"
      >
        <ScanLine className="h-5 w-5 text-white" />
        <span className="sr-only">Scan</span>
      </Button>
    </div>
  );
}
