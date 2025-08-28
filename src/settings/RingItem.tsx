import { type GridScale } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CloseRounded from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";

import { type Ring } from "../ranges/ranges";
import { Color } from "../theme/themes";
import NumberField from "../util/NumberField";

export function RingItem({
  ring,
  color,
  complete,
  gridScale,
  iconRadius,
  onChange,
  onDelete,
  ringIndex,
}: {
  color: Color;
  ring: Ring;
  complete: number;
  gridScale: GridScale;
  iconRadius: number;
  onChange?: (ring: Ring) => void;
  onDelete?: () => void;
  ringIndex: number;
}) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const primary = onChange ? (
    <TextField
      value={ring.name}
      onChange={(e) => onChange({ ...ring, name: e.target.value })}
      size="small"
      slotProps={{
        input: {
          sx: {
            bgcolor: "background.paper",
            backgroundImage: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))"
                : "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))",
          },
        },
      }}
    />
  ) : (
    <ListItemText primary={ring.name} />
  );

  const secondary = onChange ? (
    <NumberField
      aria-label="Range"
      variant="outlined"
      numberToText={(value) =>
        `${(value * gridScale.parsed.multiplier).toFixed(
          gridScale.parsed.digits
        )}`
      }
      textToNumber={(value) => parseFloat(value) / gridScale.parsed.multiplier}
      step={1}
      min={1}
      size="small"
      value={ring.radius}
      onChange={(value) => onChange({ ...ring, radius: value })}
      autoComplete="off"
      sx={{ width: "86px" }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {gridScale.parsed.unit}
            </InputAdornment>
          ),
          inputProps: {
            sx: {
              textAlign: "inherit",
            },
          },
          sx: {
            bgcolor: "background.paper",
            backgroundImage: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))"
                : "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))",
          },
        },
      }}
    />
  ) : (
    <ListItemText
      secondary={`${(ring.radius * gridScale.parsed.multiplier).toFixed(
        gridScale.parsed.digits
      )}${gridScale.parsed.unit}`}
      sx={{ textAlign: "end" }}
    />
  );

  return (
    <ListItem
      sx={{
        position: "relative",
        my: 0.5,
        pl: 1,
        pr: 0.5,
        gap: onChange ? 1 : 0.5,
        py: onChange ? 0 : "1px",
      }}
      disablePadding
    >
      {primary}
      {secondary}
      {!onChange && (
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
      )}
      {onDelete && (
        <IconButton size="small" onClick={onDelete}>
          <CloseRounded />
        </IconButton>
      )}
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
          width: isMounted ? `${complete * 100}%` : "0%",
          transition: onChange
            ? undefined
            : (theme) =>
                theme.transitions.create("width", {
                  duration: theme.transitions.duration.shorter,
                  easing: theme.transitions.easing.easeOut,
                  delay: ringIndex * 100,
                }),
          opacity: 0.2,
        }}
      />
    </ListItem>
  );
}
