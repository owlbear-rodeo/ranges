import Stack from "@mui/material/Stack";
import { Range, Ring } from "../ranges/ranges";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import { Color, getStoredTheme } from "../theme/themes";
import { useState } from "react";
import { type GridScale } from "@owlbear-rodeo/sdk";
import ListItemIcon from "@mui/material/ListItemIcon";

export function RangeEditor({
  range,
  onChange,
  readonly,
  gridScale,
}: {
  range: Range;
  gridScale: GridScale;
  onChange?: (range: Range) => void;
  readonly?: boolean;
}) {
  const [theme] = useState(() => getStoredTheme());
  return (
    <Stack>
      <List>
        {range.rings.map((ring, i, rings) => {
          const color = theme.colors[i % theme.colors.length];
          return (
            <RingItem
              key={ring.name + i}
              ring={ring}
              color={color}
              complete={(i + 1) / rings.length}
              gridScale={gridScale}
              iconRadius={i + 1}
            />
          );
        })}
      </List>
    </Stack>
  );
}

function RingItem({
  ring,
  color,
  complete,
  gridScale,
  iconRadius,
}: {
  ring: Ring;
  color: Color;
  complete: number;
  gridScale: GridScale;
  iconRadius: number;
}) {
  return (
    <ListItem sx={{ position: "relative", my: 0.5, pl: 1 }} disablePadding>
      <ListItemText primary={ring.name} />
      <ListItemText
        secondary={gridScaleToString(gridScale, ring.radius)}
        sx={{ textAlign: "end" }}
      />
      <ListItemIcon sx={{ opacity: 0.7, minWidth: 0 }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r={iconRadius}
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </ListItemIcon>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: -1,
          backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
          borderTopRightRadius: "20px",
          borderBottomRightRadius: "20px",
          width: `${complete * 100}%`,
          opacity: 0.2,
        }}
      />
    </ListItem>
  );
}

function gridScaleToString(scale: GridScale, multiplier = 1) {
  return `${(multiplier * scale.parsed.multiplier).toFixed(
    scale.parsed.digits
  )}${scale.parsed.unit}`;
}
