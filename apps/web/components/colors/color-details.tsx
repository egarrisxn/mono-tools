import { motion } from "motion/react";

interface ColorDetailsProps {
  hue: number;
  saturation: number;
  lightness: number;
}

export default function ColorDetails({ hue, saturation, lightness }: ColorDetailsProps) {
  return (
    <div className="ml-auto grid grid-cols-3 gap-3 lg:gap-6">
      <div className="flex flex-col items-center">
        <div className="text-xs tracking-tight text-gray-500 lg:text-sm lg:tracking-normal">
          H {hue}
        </div>
        <div className="bg-secondary h-1 w-14 overflow-hidden rounded-full lg:w-16">
          <motion.div
            className="dark:bg-primary h-full bg-black"
            style={{ width: `${(hue / 360) * 100}%` }}
            animate={{ width: `${(hue / 360) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-xs tracking-tight text-gray-500 lg:text-sm lg:tracking-normal">
          S {saturation}
        </div>
        <div className="bg-secondary h-1 w-14 overflow-hidden rounded-full lg:w-16">
          <motion.div
            className="dark:bg-primary h-full bg-black"
            style={{ width: `${saturation}%` }}
            animate={{ width: `${saturation}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-xs tracking-tight text-gray-500 lg:text-sm lg:tracking-normal">
          L {lightness}
        </div>
        <div className="bg-secondary h-1 w-14 overflow-hidden rounded-full lg:w-16">
          <motion.div
            className="dark:bg-primary h-full bg-black"
            style={{ width: `${lightness}%` }}
            animate={{ width: `${lightness}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
