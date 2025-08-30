import Image from 'next/image';
import Sidebar from '@/components/dashboard/sidebar';
import InputPanel from '@/components/dashboard/input-panel';

export default function Home() {
  return (
    <main className="w-full h-screen bg-[#21283C] overflow-hidden">
      <Image
        src="https://picsum.photos/1280/800"
        alt="Mountain lake background"
        width={1280}
        height={800}
        className="object-cover w-full h-full absolute inset-0 z-0"
        data-ai-hint="mountain lake"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 h-full w-full">
        <Sidebar />

        <div className="h-full ml-[220px] relative">
          <h1 
            className="font-headline font-black text-[220px] leading-none tracking-tighter text-white/20 absolute top-1/2 left-1/2" 
            style={{ transform: 'translate(-50%, calc(-50% - 120px))' }}
          >
            Luna
          </h1>

          <div 
            className="text-center absolute w-full left-1/2" 
            style={{ top: '370px', transform: 'translateX(-50%)' }}
          >
             <h2 className="font-cursive text-[44px] text-white/70 italic">
              welcome back Priyam,
             </h2>
          </div>
          
          <div 
            className="absolute left-1/2"
            style={{ top: '430px', transform: 'translateX(-50%)' }}
          >
              <InputPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
