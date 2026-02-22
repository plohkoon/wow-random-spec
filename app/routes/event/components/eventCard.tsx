import { Calendar, Image } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDateRange(event: any) {
    if (event.startDate && event.endDate) {
        return `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`;
    }
    if (event.startDate) return formatDate(event.startDate);
    if (event.endDate) return formatDate(event.endDate);
    return formatDate(event.createdAt);
}

export default function EventCard({ event }: { event: any }) {
    return (
        <Link to={`/event/${event.slug}`}>
            <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="flex">
                    <div className="relative h-32 w-32 shrink-0 overflow-hidden">
                        {/* optional for an image if provided */}
                        {event.imageUrl ? (
                            <img
                                src={event.imageUrl || "/placeholder.svg"}
                                alt={event.name}
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-none">
                                <Calendar className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>
                    <CardContent>
                        <div className="flex flex-col items-center">
                            <div className="mb-4">
                                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {event.slug}
                                </p>
                                <h3 className="mb-2 text-lg font-semibold text-card-foreground text-balance">
                                    {event.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDateRange(event)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </Link>
    )
};
