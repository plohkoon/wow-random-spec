import { redirect, useNavigate, useSubmit } from "react-router";
import { Route } from "./+types/roll";
import { allClassSpecs, availableSpecsForPlayer } from "~/lib/classes";
import { ClassDisplay } from "~/components/display/classDisplay";
import { Button } from "~/components/ui/button";
import { motion, useAnimation } from "motion/react";
import { db } from "~/lib/db.server";
import { AppSession } from "~/lib/session.server";

export const loader = async ({
  params: { slug, id },
  request,
}: Route.LoaderArgs) => {
  const session = await AppSession.fromRequest(request);
  await session.requireAdmin(`/event/${slug}`);

  const event = await db.event.findFirst({
    where: { slug: slug },
    include: {
      players: {
        where: {
          id,
        },
      },
    },
  });

  if (!event || event.players.length < 1) throw redirect(`/event/${slug}/edit`);

  const player = event.players[0];

  const items = availableSpecsForPlayer(player);

  return { items, event, player };
};
export const action = async ({ request, params: { id } }: Route.ActionArgs) => {
  const formData = await request.formData();
  const classSpec = formData.get("classSpec");

  if (typeof classSpec !== "string" || !allClassSpecs.includes(classSpec)) {
    return;
  }

  await db.player.update({
    where: {
      id,
    },
    data: {
      spec: classSpec,
    },
  });
};

export default function RollSpecForPlayer({
  params: { slug },
  loaderData: { items, player },
}: Route.ComponentProps) {
  const segmentAngle = 360 / items.length;
  const controls = useAnimation();
  const navigate = useNavigate();
  const submit = useSubmit();

  const spin = async () => {
    let randomIndex = Math.floor(Math.random() * items.length);
    // People don't like augmentation evoker so we hamfistedly reduce it's chance.
    if (items.indexOf("evoker-augmentation") !== -1) {
      const itemsWithoutAug = items.filter(
        (item) => item !== "evoker-augmentation"
      );
      const tempArray = [
        ...itemsWithoutAug,
        ...itemsWithoutAug,
        ...itemsWithoutAug,
        ...itemsWithoutAug,
        ...itemsWithoutAug,
        "evoker-augmentation",
      ];

      const randomElement =
        tempArray[Math.floor(Math.random() * tempArray.length)];
      randomIndex = items.indexOf(randomElement);
    }

    const spins = 5;
    const baseAngle = (items.length - randomIndex) * segmentAngle;
    const finalAngle = spins * 360 + baseAngle;

    // Randomize the spin length a bit
    const duration = 4 + 2 * Math.random();
    const ease = [
      [0.16, 1, 0.3, 1],
      [0.33, 1, 0.68, 1],
    ][Math.floor(Math.random() * 2)];

    await controls
      .start({
        rotate: finalAngle,
        transition: { duration, ease },
      })
      .then(() => {
        submit(
          {
            classSpec: items[randomIndex],
          },
          {
            method: "post",
          }
        );
        // Set it to the base angle so that subsequent spins actually do a full 5 spins
        controls.set({ rotate: baseAngle });
      });
  };

  const handleClose = () => {
    navigate(`/event/${slug}/edit`);
  };

  return (
    <article
      className="fixed w-screen min-h-screen h-full place-content-center grid bg-blend-darken bg-black/50 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-[#F7ECDF] dark:bg-neutral-800 rounded-lg w-[80vw] h-[80vh] p-4 grid grid-rows-[10%_80%_10%] place-content-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-center text-2xl font-bold">
          Roll a New Class for {player.nickname}
        </h1>
        <div className="relative max-w-full h-full aspect-square">
          <motion.div
            className="w-full h-full max-h-full max-w-full rounded-full grid grid-cols-1 grid-rows-1 justify-items-center place-items-center aspect-square"
            animate={controls}
            initial={{ rotate: 0 }}
            style={{ originX: "50%", originY: "50%" }}
          >
            {items.map((item, index) => {
              const angle = index * segmentAngle;
              const ratio = Math.PI / items.length;

              return (
                <ClassDisplay
                  fillIn
                  classSpec={item}
                  key={item}
                  className="w-full h-full origin-center flex flex-row justify-end items-center pr-0.5 col-start-1 row-start-1 text-2xl"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: "polygon(50% 50%, 100% 0, 100% 100%)",
                    height: "calc(100% * var(--ratio))",
                    // @ts-expect-error: CSS Variables are untyped
                    "--ratio": ratio,
                  }}
                >
                  {item}
                </ClassDisplay>
              );
            })}
          </motion.div>
          <div className="absolute top-1/2 -right-4 w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent border-b-black transform -translate-y-1/2 -rotate-90" />
        </div>
        <div className="flex flex-col items-center justify-center gap-8">
          {player.spec ? (
            <p className="text-lg">
              You got{" "}
              <ClassDisplay
                classSpec={player.spec}
                fillIn
                className="p-2 underline rounded-md"
              />{" "}
              <Button onClick={spin}>Respin</Button>
              <Button onClick={handleClose}>Done</Button>
            </p>
          ) : (
            <p>
              <Button onClick={spin}>Spin the Wheel</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
