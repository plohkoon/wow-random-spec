import { usePinwheelState } from "@/lib/pinwheelState";
import { motion, useAnimation } from "motion/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ClassDisplay } from "./classDisplay";

export function PinwheelModal() {
  const { open, respond, items, close, playerData } = usePinwheelState();

  const segmentAngle = 360 / items.length;

  const [selected, setSelected] = useState<number>(-1);
  const controls = useAnimation();

  const spin = async () => {
    const randomIndex = Math.floor(Math.random() * items.length);

    const spins = 5;
    const baseAngle = (items.length - randomIndex) * segmentAngle;
    const finalAngle = spins * 360 + baseAngle;

    await controls
      .start({
        rotate: finalAngle,
        transition: { duration: 3, ease: "easeOut" },
      })
      .then(() => {
        setSelected(randomIndex);
        // Set it to the base angle so that subsequent spins actually do a full 5 spins
        controls.set({ rotate: baseAngle });
      });
  };

  const handleClose = () => {
    if (selected < 0) {
      close();
    } else {
      respond?.(items[selected]);
    }

    setSelected(-1);
  };

  return (
    <div
      data-open={open}
      className="absolute w-screen h-screen place-content-center data-[open=true]:grid hidden bg-blend-darken bg-black/50 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-[#F7ECDF] rounded-lg w-[80vw] h-[80vh] p-4 grid grid-rows-[10%_80%_10%] place-content-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-center text-2xl font-bold">
          Roll a New Class for {playerData?.name ?? "Someone"}
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
                  className="w-full h-full origin-center flex flex-row justify-end items-center pr-0.5 col-start-1 row-start-1"
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
          {selected < 0 ? (
            <p>
              <Button onClick={spin}>Spin the Wheel</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </p>
          ) : (
            <p className="text-lg">
              You got{" "}
              <ClassDisplay
                classSpec={items[selected]}
                fillIn
                className="p-2 underline rounded-md"
              />{" "}
              <Button onClick={spin}>Respin</Button>
              <Button onClick={handleClose}>Done</Button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
