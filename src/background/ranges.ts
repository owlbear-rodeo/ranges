export type Range = {
  radius: number;
  name: string;
};

export const ranges: Range[] = [
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
];
