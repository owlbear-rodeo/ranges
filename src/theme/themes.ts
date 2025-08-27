export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Theme = {
  name: string;
  colors: Color[];
};

const base: Theme = {
  name: "Base",
  colors: [
    { r: 140, g: 75, b: 235 },
    { r: 25, g: 141, b: 230 },
    { r: 108, g: 191, b: 21 },
    { r: 222, g: 170, b: 25 },
    { r: 225, g: 105, b: 25 },
  ],
};

const deuteranopia: Theme = {
  name: "Deuteranopia",
  colors: [
    { r: 87, g: 138, b: 250 },
    { r: 208, g: 208, b: 255 },
    { r: 255, g: 223, b: 203 },
    { r: 244, g: 181, b: 0 },
    { r: 85, g: 69, b: 55 },
  ],
};

const tritanopia: Theme = {
  name: "Tritanopia",
  colors: [
    { r: 151, g: 184, b: 198 },
    { r: 180, g: 97, b: 123 },
    { r: 18, g: 165, b: 198 },
    { r: 252, g: 199, b: 209 },
    { r: 251, g: 41, b: 106 },
  ],
};

const protanopia: Theme = {
  name: "Protanopia",
  colors: [
    { r: 87, g: 138, b: 250 },
    { r: 200, g: 208, b: 255 },
    { r: 248, g: 230, b: 44 },
    { r: 109, g: 100, b: 21 },
    { r: 49, g: 46, b: 37 },
  ],
};

export const themes: Theme[] = [base, deuteranopia, tritanopia, protanopia];

export function getTheme(name: string): Theme | undefined {
  return themes.find((theme) => theme.name === name);
}

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (typeof stored === "string") {
      return getTheme(stored) ?? base;
    }
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
  }
  return base;
}
