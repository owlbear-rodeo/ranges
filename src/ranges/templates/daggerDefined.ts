import { Range } from "../ranges";

export const daggerDefined: Range = {
  name: "Dagger Defined",
  id: "dagger-defined",
  type: "circle",
  hideSize: true,
  rings: [
    {
      radius: 1,
      name: "Melee",
    },
    {
      radius: 3,
      name: "Very Close",
    },
    {
      radius: 6,
      name: "Close",
    },
    {
      radius: 12,
      name: "Far",
    },
    {
      radius: 60,
      name: "Very Far",
    },
  ],
};
