import OBR, {
  buildLabel,
  buildShape,
  isLabel,
  Math2,
  type InteractionManager,
  type Item,
  type Vector2,
} from "@owlbear-rodeo/sdk";
import rangeIcon from "./range.svg";
import { canUpdateItem } from "./permission";

const metadataKey = "rodeo.owlbear.ranges/metadata";
type RangeMetadata = {
  radius: number;
};
let rangeInteraction: InteractionManager<Item[]> | null = null;
let tokenInteraction: InteractionManager<Item> | null = null;
let grabOffset: Vector2 = { x: 0, y: 0 };

const ranges = [
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
  {
    radius: Infinity,
    name: "Out of Range",
  },
];

function getRing(center: Vector2, radius: number, name: string) {
  return buildShape()
    .fillOpacity(0)
    .strokeWidth(2)
    .strokeOpacity(0.5)
    .strokeColor("white")
    .strokeDash([10, 10])
    .shapeType("CIRCLE")
    .position(center)
    .width(radius * 2)
    .height(radius * 2)
    .name(name)
    .metadata({
      [metadataKey]: {},
    })
    .layer("POPOVER")
    .build();
}

function getLabel(center: Vector2, radius: number, name: string) {
  return buildLabel()
    .fillColor("white")
    .fillOpacity(0.8)
    .plainText(name)
    .position(Math2.subtract(center, { x: 0, y: radius }))
    .pointerDirection("UP")
    .backgroundOpacity(0)
    .metadata({
      [metadataKey]: {
        radius: radius,
      },
    })
    .layer("POPOVER")
    .build();
}

async function getRangeItems(center: Vector2): Promise<Item[]> {
  const dpi = await OBR.scene.grid.getDpi();
  const items = [];
  for (const range of ranges) {
    // Skip the outer bounds
    if (range.radius === Infinity) {
      continue;
    }
    // Offset the ring by half a grid unit to account for the center of the grid
    const radius = range.radius * dpi + dpi / 2;
    items.push(getRing(center, radius, range.name));
    items.push(getLabel(center, radius, range.name));
  }

  return items;
}

function cancelInteractions() {
  if (rangeInteraction) {
    const cancel = rangeInteraction[1];
    cancel();
    rangeInteraction = null;
  }
  if (tokenInteraction) {
    const cancel = tokenInteraction[1];
    cancel();
    tokenInteraction = null;
  }
}

function hasMetadata(
  item: Item
): item is Item & { metadata: { [metadataKey]: RangeMetadata } } {
  return metadataKey in item.metadata;
}

export function createRangeTool() {
  OBR.tool.createMode({
    id: "rodeo.owlbear.ranges/tool",
    icons: [
      {
        icon: rangeIcon,
        label: "Range",
        filter: {
          activeTools: ["rodeo.owlbear.tool/measure"],
          permissions: ["RULER_CREATE"],
        },
      },
    ],
    async onToolDragStart(_, event) {
      cancelInteractions();

      const tokenPosition =
        event.target && !event.target.locked && event.target.position;
      const initialPosition = tokenPosition || event.pointerPosition;
      // Account for the grab offset so the token doesn't snap to the pointer
      if (tokenPosition) {
        grabOffset = Math2.subtract(event.pointerPosition, tokenPosition);
      } else {
        grabOffset = { x: 0, y: 0 };
      }

      // Check the token interaction first so the move event doesn't fire for the
      // range items while checking the permissions
      if (
        event.target &&
        !event.target.locked &&
        event.target.type === "IMAGE" &&
        (await canUpdateItem(event.target))
      ) {
        tokenInteraction = await OBR.interaction.startItemInteraction(
          event.target
        );
      }

      const rangeItems = await getRangeItems(initialPosition);
      rangeInteraction = await OBR.interaction.startItemInteraction(rangeItems);
    },
    async onToolDragMove(_, event) {
      if (tokenInteraction) {
        const update = tokenInteraction[0];
        const position = await OBR.scene.grid.snapPosition(
          Math2.subtract(event.pointerPosition, grabOffset)
        );
        update?.((token) => {
          token.position = position;
        });
      } else if (rangeInteraction) {
        const update = rangeInteraction[0];
        update?.((items) => {
          for (const item of items) {
            if (!hasMetadata(item)) {
              continue;
            }
            const metadata = item.metadata[metadataKey];
            if (isLabel(item)) {
              // Offset the label to the top of the ring
              const range = metadata.radius;
              item.position = Math2.subtract(event.pointerPosition, {
                x: 0,
                y: range,
              });
            } else {
              item.position = event.pointerPosition;
            }
          }
        });
      }
    },
    onToolDragEnd() {
      if (tokenInteraction) {
        const final = tokenInteraction[0](() => {});
        OBR.scene.items.updateItems([final.id], (items) => {
          const item = items[0];
          if (!item) {
            return;
          }
          item.position = final.position;
          if (!item.disableAutoZIndex) {
            item.zIndex = Date.now();
          }
        });
      }
      cancelInteractions();
    },
    onToolDragCancel() {
      cancelInteractions();
    },
    onDeactivate() {
      cancelInteractions();
    },
    shortcut: "R",
    cursors: [
      {
        cursor: "grabbing",
        filter: {
          dragging: true,
          target: [
            {
              value: "IMAGE",
              key: "type",
            },
          ],
        },
      },
      {
        cursor: "grab",
        filter: {
          dragging: false,
          target: [
            {
              value: "IMAGE",
              key: "type",
            },
            {
              value: false,
              key: "locked",
            },
          ],
        },
      },
      {
        cursor: "crosshair",
      },
    ],
  });
}
