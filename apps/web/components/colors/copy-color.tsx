import { motion } from "motion/react";
import { Check, Copy } from "lucide-react";

interface CopyColorProps {
  copyToClipboard: (value: string) => void;
  hex: string;
  copiedHex: string | null;
}

export default function CopyColor({ copyToClipboard, hex, copiedHex }: CopyColorProps) {
  return (
    <motion.div
      className="flex cursor-pointer items-center gap-0.5 font-mono text-xs tracking-tight lg:gap-1.5 lg:text-base lg:tracking-normal"
      onClick={() => copyToClipboard(hex)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {hex}
      {copiedHex === hex ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Check className="size-3 text-green-500 lg:size-4" />
        </motion.div>
      ) : (
        <Copy className="size-3 opacity-50 lg:size-4" />
      )}
    </motion.div>
  );
}
