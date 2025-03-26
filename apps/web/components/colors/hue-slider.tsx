import { motion } from "motion/react";
import { Slider } from "@repo/ui/src/components/slider";

interface HueSliderProps {
  hueShift: number;
  setHueShift: (value: number) => void;
}

export default function HueSlider({ hueShift, setHueShift }: HueSliderProps) {
  return (
    <motion.div
      className="space-y-2"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex justify-between">
        <label className="text-sm font-medium">Hue Shift</label>
        <motion.span
          className="text-sm text-gray-500"
          animate={{
            x: hueShift === 0 ? [0, 5, -5, 5, -5, 0] : 0,
            transition: { duration: hueShift === 0 ? 0.5 : 0 },
          }}
        >
          {hueShift}°
        </motion.span>
      </div>
      <Slider
        value={[hueShift]}
        min={-180}
        max={180}
        step={1}
        onValueChange={(value) => {
          if (value[0] !== undefined) {
            setHueShift(value[0]);
          }
        }}
        className="transition-all duration-150 ease-out"
      />
    </motion.div>
  );
}
