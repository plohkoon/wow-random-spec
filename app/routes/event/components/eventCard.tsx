import { Image } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";


export default function EventCard({event} : {event: any}) {
  return (
                <Link to={`/event/${event.slug}`}>
    <Card>
        <CardContent></CardContent>
        <div className="flex flex-col items-center">
            <div className="mb-4">
                <h1>{event.name}</h1>
                
                
                
                
                </div>
        </div>
    </Card>
                </Link>
  )
}