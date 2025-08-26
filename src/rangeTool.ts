import OBR from "@owlbear-rodeo/sdk";
import rangeIcon from "./range.svg";

export function createRangeTool() {
  OBR.tool.createMode({
    id: "rodeo.owlbear.ranges/range",
    icons: [
      {
        icon: rangeIcon,
        label: "Range",
        filter: {
          activeTools: ["rodeo.owlbear.tool/measure"],
        },
      },
    ],
  });
}
