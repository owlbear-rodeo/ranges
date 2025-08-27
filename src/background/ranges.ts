export type Ring = {
  radius: number;
  name: string;
};

export type RangeType = "circle" | "square";

export type Range = {
  type: RangeType;
  rings: Ring[];
};

export const range: Range = {
  type: "circle",
  rings: [
    {
      radius: 1,
      name: "Melee",
    },
    {
      radius: 2,
      name: "Very Close",
    },
    {
      radius: 6,
      name: "Close",
    },
    {
      radius: 20,
      name: "Far",
    },
    {
      radius: 60,
      name: "Very Far",
    },
  ],
};
