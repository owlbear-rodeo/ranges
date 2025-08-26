import OBR, {
  buildEffect,
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
import rangeSksl from "./range.frag";

const metadataKey = "rodeo.owlbear.ranges/metadata";
type RangeMetadata = {
  radius: number;
};
let rangeInteraction: InteractionManager<Item[]> | null = null;
let tokenInteraction: InteractionManager<Item> | null = null;
let shader: Item | null = null;
let grabOffset: Vector2 = { x: 0, y: 0 };
let downTarget: Item | null = null;
let labelOffset = -16;

type Range = {
  radius: number;
  name: string;
  uniformColor: [number, number, number];
  uniformName: string;
  color: string;
};

const ranges: Range[] = [
  {
    radius: 1,
    name: "Melee",
    uniformName: "melee",
    uniformColor: [0.54, 0.21, 1],
    color: "#8836FF",
  },
  {
    radius: 2,
    name: "Very Close",
    uniformName: "very_close",
    uniformColor: [0, 0.56, 1],
    color: "#0091FF",
  },
  {
    radius: 6,
    name: "Close",
    uniformName: "close",
    uniformColor: [0.42, 0.83, 0],
    color: "#6DD400",
  },
  {
    radius: 20,
    name: "Far",
    uniformName: "far",
    uniformColor: [0.96, 0.7, 0],
    color: "#F7B500",
  },
  {
    radius: 60,
    name: "Very Far",
    uniformName: "very_far",
    uniformColor: [0.98, 0.39, 0.2],
    color: "#FA6400",
  },
];

function getRing(center: Vector2, radius: number, name: string, color: string) {
  return buildShape()
    .fillOpacity(0)
    .strokeWidth(2)
    .strokeOpacity(0.8)
    .strokeColor(color)
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

function getLabel(
  center: Vector2,
  radius: number,
  name: string,
  color: string
) {
  return buildLabel()
    .fillColor("white")
    .fillOpacity(1.0)
    .plainText(name)
    .position(Math2.subtract(center, { x: 0, y: radius + labelOffset }))
    .pointerDirection("UP")
    .backgroundOpacity(0.5)
    .backgroundColor(color)
    .padding(4)
    .cornerRadius(20)
    .pointerHeight(0)
    .metadata({
      [metadataKey]: {
        radius: radius,
      },
    })
    .minViewScale(1)
    .layer("POPOVER")
    .build();
}

function getRadiusForRange(range: Range, dpi: number) {
  // Offset the ring by half a grid unit to account for the center of the grid
  return range.radius * dpi + dpi / 2;
}

async function getShader(center: Vector2) {
  const dpi = await OBR.scene.grid.getDpi();
  return buildEffect()
    .sksl(rangeSksl)
    .effectType("VIEWPORT")
    .position(center)
    .layer("POINTER")
    .zIndex(0)
    .blendMode("COLOR")
    .uniforms(
      ranges.map((range) => ({
        name: range.uniformName,
        value: [
          ...range.uniformColor,
          getRadiusForRange(range, dpi),
          0,
          0,
          0,
          0,
          0,
        ],
      }))
    )
    .build();
}

async function getRangeItems(center: Vector2): Promise<Item[]> {
  const dpi = await OBR.scene.grid.getDpi();
  const items = [];
  for (const range of ranges) {
    const radius = getRadiusForRange(range, dpi);
    items.push(getRing(center, radius, range.name, range.color));
    items.push(getLabel(center, radius, range.name, range.color));
  }

  return items;
}

function cleanup() {
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
  if (shader) {
    OBR.scene.local.deleteItems([shader.id]);
    shader = null;
  }
  downTarget = null;
}

function finalizeMove() {
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
    onToolClick() {
      return false;
    },
    async onToolDown(_, event) {
      cleanup();

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
        downTarget = event.target;
      }

      shader = await getShader(initialPosition);
      await OBR.scene.local.addItems([shader]);

      const rangeItems = await getRangeItems(initialPosition);
      rangeInteraction = await OBR.interaction.startItemInteraction(rangeItems);
    },
    async onToolDragStart() {
      if (downTarget) {
        tokenInteraction = await OBR.interaction.startItemInteraction(
          downTarget
        );
      }
    },
    async onToolDragMove(_, event) {
      // Check the down target first as that's the earliest indicator of a valid target
      if (downTarget) {
        if (tokenInteraction) {
          const update = tokenInteraction[0];
          const position = await OBR.scene.grid.snapPosition(
            Math2.subtract(event.pointerPosition, grabOffset)
          );
          update?.((token) => {
            token.position = position;
          });
        }
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
                y: range + labelOffset,
              });
            } else {
              item.position = event.pointerPosition;
            }
          }
        });
        if (shader) {
          OBR.scene.local.updateItems([shader], (items) => {
            const item = items[0];
            if (!item) {
              return;
            }
            item.position = event.pointerPosition;
          });
        }
      }
    },
    onToolDragEnd() {
      finalizeMove();
      cleanup();
    },
    onToolDragCancel() {
      cleanup();
    },
    onDeactivate() {
      cleanup();
    },
    onToolUp() {
      finalizeMove();
      cleanup();
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
