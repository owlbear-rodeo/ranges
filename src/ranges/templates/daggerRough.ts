import { Range } from "../ranges";

export const daggerRough: Range = {
  name: "Dagger Rough",
  id: "dagger-rough",
  type: "circle",
  hideSize: true,
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
      radius: 30,
      name: "Far",
    },
    {
      radius: 60,
      name: "Very Far",
    },
  ],
};
