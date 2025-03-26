import { motion } from "motion/react";

interface ColorSquareProps {
  className?: string;
  baseColor?: string;
  hue?: string;
}

export default function ColorSquare({ className, baseColor, hue }: ColorSquareProps) {
  return (
    <motion.div
      className={`${className} size-8 rounded`}
      style={{ backgroundColor: baseColor || hue }}
      animate={{ backgroundColor: baseColor || hue }}
      transition={{ duration: 0.3 }}
    />
  );
}
