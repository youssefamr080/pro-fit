import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function OffersTicker() {
    const { data: announcements = [] } = useAnnouncements();

    if (announcements.length === 0) return null;

    return (
        <div className="bg-foreground text-background py-2 relative group flex overflow-hidden">
            {/* Gradient mask for smooth edge fade */}
            <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-foreground to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-foreground to-transparent z-10 pointer-events-none" />

            <div className="marquee whitespace-nowrap flex gap-12 text-xs font-cairo font-bold group-hover:[animation-play-state:paused] w-max">
                {announcements.map((a) => (
                    <span key={a.id} className="cursor-default">{a.text}</span>
                ))}
                {announcements.map((a) => (
                    <span key={`dup-${a.id}`} className="cursor-default">{a.text}</span>
                ))}
            </div>
        </div>
    );
}
