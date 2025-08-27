import OBR, {
  buildEffect,
  buildLabel,
  buildShape,
  isLabel,
  Math2,
  type InteractionManager,
  type Item,
  type Vector2,
  type Uniform,
} from "@owlbear-rodeo/sdk";
import rangeIcon from "../assets/range.svg";
import { canUpdateItem } from "./permission";
import rangeSksl from "./range.frag";
import { getPluginId } from "../util/getPluginId";
import { getMetadata } from "../util/getMetadata";
import { getStoredTheme, Theme } from "../theme/themes";

let rangeInteraction: InteractionManager<Item[]> | null = null;
let tokenInteraction: InteractionManager<Item> | null = null;
let shader: Item | null = null;
let grabOffset: Vector2 = { x: 0, y: 0 };
let downTarget: Item | null = null;
let labelOffset = -16;

type Range = {
  radius: number;
  name: string;
};

const ranges: Range[] = [
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
      [getPluginId("radius")]: radius,
    })
    .disableHit(true)
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
    .padding(8)
    .cornerRadius(20)
    .pointerHeight(0)
    .metadata({
      [getPluginId("radius")]: radius,
    })
    .minViewScale(1)
    .disableHit(true)
    .layer("POPOVER")
    .build();
}

function getRadiusForRange(range: Range, dpi: number) {
  // Offset the ring by half a grid unit to account for the center of the grid
  return range.radius * dpi + dpi / 2;
}

async function getShader(center: Vector2, theme: Theme) {
  const dpi = await OBR.scene.grid.getDpi();
  const uniforms: Uniform[] = [];
  for (let i = 0; i < ranges.length; i++) {
    if (i >= theme.colors.length) {
      console.warn(`Theme ${theme.name} has less colors than ranges`);
      break;
    }
    const color = theme.colors[i];
    uniforms.push({
      name: `circle${i + 1}`,
      value: [
        color.r / 255,
        color.g / 255,
        color.b / 255,
        getRadiusForRange(ranges[i], dpi),
        0,
        0,
        0,
        0,
        0,
      ],
    });
  }

  return buildEffect()
    .sksl(rangeSksl)
    .effectType("VIEWPORT")
    .position(center)
    .layer("POINTER")
    .zIndex(0)
    .blendMode("COLOR")
    .uniforms(uniforms)
    .build();
}

async function getRangeItems(center: Vector2, theme: Theme): Promise<Item[]> {
  const dpi = await OBR.scene.grid.getDpi();
  const items = [];
  for (let i = 0; i < ranges.length; i++) {
    if (i >= theme.colors.length) {
      console.warn(`Theme ${theme.name} has less colors than ranges`);
      break;
    }
    const color = theme.colors[i];
    const range = ranges[i];
    const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;
    const radius = getRadiusForRange(range, dpi);
    items.push(getRing(center, radius, range.name, colorString));
    items.push(getLabel(center, radius, range.name, colorString));
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

async function finalizeMove() {
  if (tokenInteraction) {
    const final = tokenInteraction[0](() => {});
    const withAttachments = await OBR.scene.items.getItemAttachments([
      final.id,
    ]);
    withAttachments.sort((a, b) => a.zIndex - b.zIndex);
    await OBR.scene.items.updateItems(withAttachments, (items) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === final.id) {
          item.position = final.position;
        }
        if (!item.disableAutoZIndex) {
          item.zIndex = Date.now() + i;
        }
      }
    });
  }
}

export function createRangeTool() {
  OBR.tool.createMode({
    id: getPluginId("mode/range"),
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

      const theme = getStoredTheme();
      shader = await getShader(initialPosition, theme);
      await OBR.scene.local.addItems([shader]);

      const rangeItems = await getRangeItems(initialPosition, theme);
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
            if (isLabel(item)) {
              const radius = getMetadata(
                item.metadata,
                getPluginId("radius"),
                0
              );
              // Offset the label to the top of the ring
              item.position = Math2.subtract(event.pointerPosition, {
                x: 0,
                y: radius + labelOffset,
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
