import { isPlainObject } from "../util/isPlainObject";
import { daggerDefined } from "./templates/daggerDefined";
import { daggerRough } from "./templates/daggerRough";
import { steel } from "./templates/steel";

export type Ring = {
  radius: number;
  name: string;
};

export type RangeType = "circle" | "square";

export type Range = {
  name: string;
  id: string;
  type: RangeType;
  rings: Ring[];
  hideLabel?: boolean;
  hideSize?: boolean;
};

export const defaultRanges: Range[] = [daggerDefined, daggerRough, steel];

function isRange(value: unknown): value is Range {
  return (
    isPlainObject(value) &&
    "name" in value &&
    "id" in value &&
    "type" in value &&
    "rings" in value
  );
}

export function getCustomRanges(): Range[] {
  try {
    const stored = localStorage.getItem("ranges");
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.filter(isRange);
    }
  } catch (error) {
    console.warn("Failed to read custom ranges from localStorage:", error);
  }
  return [];
}
