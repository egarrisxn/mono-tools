"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  hexToHSL,
  hslToHex,
  formatHexValue,
  generateColorShades,
  getLuminance,
} from "@/utils/palette";
import DownloadJson from "./download-json";
import ColorSquare from "./color-square";
import ColorInput from "./color-input";
import ColorDetails from "./color-details";
import VibrancySlider from "./vibrancy-slider";
import HueSlider from "./hue-slider";
import RandomizeColor from "./randomize-color";
import CopyColor from "./copy-color";
import AccessibilityPassing from "./accessibility-passing";
import AccessibilityFailing from "./accessibility-failing";

import type { ColorShade, AccessibilityScore } from "@/utils/types";

export default function PaletteGenerator() {
  const [baseColor, setBaseColor] = useState("#15437F");
  const [vibrancy, setVibrancy] = useState(50);
  const [hueShift, setHueShift] = useState(0);
  const [colorShades, setColorShades] = useState<ColorShade[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(baseColor);
  const [isRandomizing, setIsRandomizing] = useState(false);

  // Memoize color shades
  const memoizedColorShades = useMemo(
    () => generateColorShades(baseColor, vibrancy, hueShift),
    [baseColor, vibrancy, hueShift],
  );

  useEffect(() => {
    setColorShades(memoizedColorShades);
  }, [memoizedColorShades]);

  useEffect(() => {
    if (copiedHex) {
      const timeout = setTimeout(() => setCopiedHex(null), 1000);
      return () => clearTimeout(timeout);
    }
  }, [copiedHex]);

  useEffect(() => {
    setInputValue(baseColor);
  }, [baseColor]);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.success(`${hex} has been copied to your clipboard.`);
  };

  const downloadPalette = () => {
    const palette = colorShades.reduce(
      (acc, { shade, hex }) => {
        acc[shade] = hex;
        return acc;
      },
      {} as Record<number, string>,
    );
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(palette, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `palette-${baseColor.replace("#", "")}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const randomizeColor = () => {
    setIsRandomizing(true);
    setVibrancy(50);
    setHueShift(0);

    const completelyRandom = Math.random() < 0.3;
    const [currentHue] = hexToHSL(baseColor);

    const newHue = completelyRandom
      ? Math.floor(Math.random() * 360)
      : (currentHue + (Math.random() * 120 - 60) + 360) % 360;
    const newSaturation = 20 + Math.random() * 80;
    const newLightness = 20 + Math.random() * 60;

    const newColor = hslToHex(newHue, newSaturation, newLightness);
    setBaseColor(newColor);
    setInputValue(newColor);
    toast.success(`Randomized base color: ${newColor}`);

    setTimeout(() => setIsRandomizing(false), 500);
  };

  const getContrastRatio = useCallback((color1: string, color2: string) => {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const calculatePaletteAccessibility = useMemo(() => {
    const testShades = [50, 100, 200, 500, 700, 900];
    const results: AccessibilityScore[] = [];

    for (let i = 0; i < testShades.length; i++) {
      for (let j = i + 1; j < testShades.length; j++) {
        const bgShade = colorShades.find((s) => s.shade === testShades[i]);
        const fgShade = colorShades.find((s) => s.shade === testShades[j]);

        if (bgShade && fgShade) {
          const ratio = getContrastRatio(bgShade.hex, fgShade.hex);
          let level = "";
          let pass = false;

          if (ratio >= 7) {
            level = "AAA";
            pass = true;
          } else if (ratio >= 4.5) {
            level = "AA";
            pass = true;
          } else if (ratio >= 3) {
            level = "AA Large";
            pass = true;
          } else {
            level = "Fail";
            pass = false;
          }

          results.push({
            background: bgShade,
            foreground: fgShade,
            ratio,
            level,
            pass,
          });
        }
      }
    }
    return results.sort((a, b) => b.ratio - a.ratio);
  }, [colorShades, getContrastRatio]);

  const passingCombinations = useMemo(
    () => calculatePaletteAccessibility.filter((score) => score.pass),
    [calculatePaletteAccessibility],
  );

  const failingCombinations = useMemo(
    () => calculatePaletteAccessibility.filter((score) => !score.pass),
    [calculatePaletteAccessibility],
  );

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <motion.div
        className="flex flex-row items-center justify-between border-b p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-row items-center gap-2">
          <ColorSquare baseColor={baseColor} />
          <span className="text-xs leading-none text-slate-500 sm:pt-0.5 sm:text-base">
            {baseColor}
          </span>
        </div>

        <div className="flex">
          <DownloadJson downloadPalette={downloadPalette} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <motion.div
            className="space-y-4 rounded-lg border p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Color randomizer */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Base Color</h3>
              <div className="flex items-center gap-2">
                <RandomizeColor randomizeColor={randomizeColor} isRandomizing={isRandomizing} />
                <ColorSquare baseColor={baseColor} />
              </div>
            </div>

            {/* Color selector */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <HexColorPicker
                color={baseColor}
                onChange={setBaseColor}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>

            {/* Color input (#hex) */}
            <div className="flex items-center gap-2">
              <ColorSquare baseColor={baseColor} />
              <ColorInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                setBaseColor={setBaseColor}
                formatHexValue={(value) => formatHexValue(value, baseColor)}
              />
            </div>
          </motion.div>

          {/* Vibrancy & hue adjustment */}
          <motion.div
            className="space-y-4 p-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <VibrancySlider vibrancy={vibrancy} setVibrancy={setVibrancy} />
            <HueSlider hueShift={hueShift} setHueShift={setHueShift} />
          </motion.div>

          {/* Hue visualizer */}
          <motion.div
            className="flex h-24 overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
            {colorShades.map(({ shade, hex }, index) => (
              <motion.div
                key={shade}
                className="flex-1"
                style={{ backgroundColor: hex }}
                title={`${shade}: ${hex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              />
            ))}
          </motion.div>

          {/* Accessibility check */}
          <motion.div
            className="rounded-lg border p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">Accessibility Pairs</h3>
              <div className="text-xs text-gray-500">
                {passingCombinations.length} passing / {calculatePaletteAccessibility.length} total
              </div>
            </div>
            <div className="space-y-4">
              <AccessibilityPassing combinations={passingCombinations} />
              <AccessibilityFailing combinations={failingCombinations} />
            </div>
          </motion.div>
        </div>

        {/* Color palette (50-900) */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {colorShades.map(({ shade, hex, hue, saturation, lightness }, index) => (
            <motion.div
              key={shade}
              className="flex flex-row items-center gap-1 rounded-lg p-1 transition-all duration-200 hover:bg-gray-100 sm:p-4 md:px-0 lg:p-4 dark:hover:bg-gray-800"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              whileHover={{ scale: 1.01, x: 5 }}
            >
              <ColorSquare className="lg:mr-4 lg:size-10" baseColor={hex} />
              <div className="w-6 text-xs font-bold tracking-tight lg:w-10 lg:text-lg lg:tracking-normal">
                {shade}
              </div>
              <CopyColor copyToClipboard={copyToClipboard} hex={hex} copiedHex={copiedHex} />
              <ColorDetails hue={hue} saturation={saturation} lightness={lightness} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
