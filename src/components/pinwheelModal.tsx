import { classes } from "@/lib/classes";
import { usePinwheelState } from "@/lib/pinwheelState";
import { motion, useAnimation } from "motion/react";
import { useState } from "react";
import { Button } from "./ui/button";

export function PinwheelModal() {
  const state = usePinwheelState();

  const items = classes;
  const segmentAngle = 360 / items.length;

  const [selected, setSelected] = useState<number | null>(null);
  const controls = useAnimation();

  const spin = async () => {
    const randomIndex = Math.floor(Math.random() * items.length);

    const spins = 5; // Full spins for effect
    const finalAngle =
      spins * 360 + (items.length - randomIndex) * segmentAngle;

    await controls
      .start({
        rotate: finalAngle,
        transition: { duration: 3, ease: "easeOut" },
      })
      .then(() => setSelected(randomIndex));
  };

  return (
    <div
      data-open={state.open}
      className="absolute w-screen h-screen place-content-center data-[open=true]:grid hidden bg-blend-darken bg-black/50 z-50"
    >
      <div className="bg-[#F7ECDF] rounded-lg w-[80vw] h-[80vh] p-4 flex flex-col">
        <h1 className="text-center text-2xl font-bold">
          Pick a class for NAME
        </h1>
        <div className="flex flex-col items-center justify-center min-h-screen gap-8">
          <div className="relative w-128 h-128">
            <motion.div
              className="absolute top-0 left-0 w-full h-full rounded-full grid grid-cols-1 grid-rows-1 justify-items-center place-items-center"
              animate={controls}
              initial={{ rotate: 0 }}
              style={{ originX: "50%", originY: "50%" }}
            >
              {items.map((item, index) => {
                const angle = index * segmentAngle;
                const isEven = index % 2 === 0;
                const background = isEven ? "#f9c74f" : "#90be6d"; // Alternate colors

                const ratio = Math.PI / items.length;

                return (
                  <div
                    key={item}
                    className="w-full h-full origin-center flex flex-row justify-end items-center pr-0.5 col-start-1 row-start-1"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      clipPath: "polygon(50% 50%, 100% 0, 100% 100%)",
                      background,
                      height: "calc(100% * var(--ratio))",
                      // @ts-expect-error: CSS Variables are untyped
                      "--ratio": ratio,
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </motion.div>
            <div className="absolute top-1/2 left-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent border-b-black transform -translate-x-1/2 -translate-y-full" />
          </div>
          <Button onClick={spin}>Spin the Wheel</Button>
          {selected !== null && (
            <p className="text-lg">Result: {items[selected]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
