import { motion } from "motion/react";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";

interface DownloadJsonProps {
  downloadPalette: () => void;
}

export default function DownloadJson({ downloadPalette }: DownloadJsonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button variant="outline" size="icon" onClick={downloadPalette}>
        <Download className="size-4" />
        <span className="sr-only">Download JSON</span>
      </Button>
    </motion.div>
  );
}
