import Image from 'next/image';
import Sidebar from '@/components/dashboard/sidebar';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';

async function getDailyWallpaper() {
    // If Unsplash credentials aren't provided, return a default wallpaper.
    if (!process.env.UNSPLASH_ACCESS_KEY) {
        return "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070";
    }

    try {
        const res = await fetch('https://api.unsplash.com/photos/random?query=mac-wallpaper&orientation=landscape&content_filter=high', {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            },
            next: { revalidate: 86400 } // Revalidate once per day (86400 seconds)
        });

        if (!res.ok) {
            console.error('Failed to fetch wallpaper from Unsplash:', await res.text());
            return "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070";
        }

        const data = await res.json();
        return data.urls.full;
    } catch (error) {
        console.error('Error fetching wallpaper:', error);
        return "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070";
    }
}

export default async function Home() {
  const wallpaperUrl = await getDailyWallpaper();

  return (
    <main className="w-full h-screen bg-[#21283C] overflow-hidden">
      <Image
        src={wallpaperUrl}
        alt="mac wallpaper"
        fill
        className="object-cover w-full h-full absolute inset-0 z-0"
        data-ai-hint="abstract gradient"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 h-full w-full">
        <Sidebar />

        <div className="h-full ml-[80px] relative">
          <h1 
            className="gradient-glow font-headline font-black text-[220px] leading-none tracking-tighter absolute top-1/2 left-1/2" 
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
            className="absolute left-1/2 w-[560px]"
            style={{ top: '450px', transform: 'translateX(-50%)' }}
          >
              <PromptInputBox />
          </div>
        </div>
      </div>
    </main>
  );
}
