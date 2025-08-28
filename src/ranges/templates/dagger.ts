import { Range } from "../ranges";

export const dagger: Range = {
  name: "Dagger",
  id: "dagger",
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
