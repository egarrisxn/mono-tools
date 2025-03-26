import { motion } from "motion/react";

interface ColorInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  setBaseColor: (value: string) => void;
  formatHexValue: (value: string) => string;
}

export default function ColorInput({
  inputValue,
  setInputValue,
  setBaseColor,
  formatHexValue,
}: ColorInputProps) {
  return (
    <motion.input
      type="text"
      value={inputValue}
      onChange={(e) => {
        // Always update the input value as the user types
        setInputValue(e.target.value);
      }}
      onBlur={() => {
        // When the user clicks outside, try to convert to a valid hex
        const validHex = formatHexValue(inputValue);
        setInputValue(validHex);
        setBaseColor(validHex);
      }}
      onKeyDown={(e) => {
        // When the user presses Enter, update the color
        if (e.key === "Enter") {
          const validHex = formatHexValue(inputValue);
          setInputValue(validHex);
          setBaseColor(validHex);
          e.currentTarget.blur();
        }
      }}
      className="focus:ring-primary flex-1 rounded-lg border px-3 py-2 font-mono text-sm transition-all duration-200 focus:border-transparent focus:ring-2"
      placeholder="#RRGGBB"
      initial={{ scale: 1 }}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    />
  );
}
