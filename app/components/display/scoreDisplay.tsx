import clsx from "clsx";
import { scoreTiersDesc } from "~/lib/scores";

export function ScoreDisplay<C extends React.ElementType = "span">({
  score,
  individual,
  as,
  className,
  style,
  ...rest
}: {
  score: number;
  individual?: boolean;
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, "children">) {
  const Component = as || "span";

  const scoreToCompute = individual ? score * 8 : score;

  const color = scoreTiersDesc.find(
    (tier) => tier.score <= scoreToCompute
  )?.rgbHex;

  return (
    <Component
      {...rest}
      className={clsx(className)}
      style={{ ...style, color }}
    >
      <span> {score.toLocaleString()}</span>
    </Component>
  );
}
