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
    { r: 136, g: 54, b: 255 },
    { r: 0, g: 145, b: 255 },
    { r: 109, g: 212, b: 0 },
    { r: 247, g: 181, b: 0 },
    { r: 250, g: 100, b: 0 },
  ],
};

const deuteranopia: Theme = {
  name: "Deuteranopia",
  colors: [
    { r: 11, g: 81, b: 176 },
    { r: 109, g: 133, b: 205 },
    { r: 243, g: 223, b: 48 },
    { r: 219, g: 200, b: 0 },
    { r: 151, g: 138, b: 0 },
  ],
};

const tritanopia: Theme = {
  name: "Tritanopia",
  colors: [
    { r: 180, g: 97, b: 123 },
    { r: 18, g: 165, b: 198 },
    { r: 93, g: 209, b: 246 },
    { r: 252, g: 199, b: 209 },
    { r: 251, g: 41, b: 106 },
  ],
};

const protanopia: Theme = {
  name: "Protanopia",
  colors: [
    { r: 0, g: 105, b: 216 },
    { r: 87, g: 138, b: 250 },
    { r: 248, g: 230, b: 44 },
    { r: 181, g: 166, b: 3 },
    { r: 109, g: 100, b: 21 },
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
