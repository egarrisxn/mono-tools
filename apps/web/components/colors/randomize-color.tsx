import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";

interface RandomizeColorProps {
  randomizeColor: () => void;
  isRandomizing: boolean;
}

export default function RandomizeColor({ randomizeColor, isRandomizing }: RandomizeColorProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={randomizeColor}
          className="text-xs"
          disabled={isRandomizing}
        >
          <RefreshCw className={`mr-1 size-3 ${isRandomizing ? "animate-spin" : ""}`} />
          Randomize
        </Button>
      </motion.div>
    </div>
  );
}
