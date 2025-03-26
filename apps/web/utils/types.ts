export interface ColorShade {
  hex: string;
  shade: number;
  hue: number;
  saturation: number;
  lightness: number;
}

export interface AccessibilityScore {
  background: ColorShade;
  foreground: ColorShade;
  ratio: number;
  level: string;
  pass: boolean;
}
