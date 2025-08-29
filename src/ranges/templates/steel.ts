import { Range } from "../ranges";

export const steel: Range = {
  name: "Steel",
  id: "steel",
  type: "square",
  rings: [
    {
      radius: 1,
      name: "Melee",
      id: "steel-melee",
    },
    {
      radius: 3,
      name: "Shift",
      id: "steel-shift",
    },
    {
      radius: 5,
      name: "Ranged 5",
      id: "steel-ranged",
    },
    {
      radius: 10,
      name: "Ranged 10",
      id: "steel-ranged-2",
    },
    {
      radius: 12,
      name: "Ranged 12",
      id: "steel-ranged-3",
    },
  ],
};
