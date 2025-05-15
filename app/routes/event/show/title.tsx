import { Link } from "react-router";
import { H2 } from "~/components/display/headers";
import { Button } from "~/components/ui/button";

type TitleProps = {
    event: string;
    slug: string;
    isAdmin: boolean;
}
//Function for event titles.
export default function EventTitle({event, slug, isAdmin}: TitleProps) {
    console.log(isAdmin);
    return (
      <>
        <div className="flex items-center justify-between mb-2 mt-12">
          <div>
            <Button asChild>
              <Link to={`/event/${slug}/lists`} className="underline">
                View Lists {">"}
              </Link>
            </Button>
          </div>
          <div className="flex-1 text-center mb-4">
            <H2>{event}</H2>
            {isAdmin && (
              <div className="text-center mb-6 mt-4">
                <Button asChild>
                  <Link to={`/event/${slug}/edit`}>Edit Event</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </>
    );
}