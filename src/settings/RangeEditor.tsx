import { useState } from "react";
import { type GridScale } from "@owlbear-rodeo/sdk";

import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";

import { SmallLabel } from "./SmallLabel";
import { RingItem } from "./RingItem";
import { RangeTypeButtonGroup } from "./RangeTypeButtonGroup";
import { getStoredTheme } from "../theme/themes";
import { Range } from "../ranges/ranges";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import AddRounded from "@mui/icons-material/AddRounded";

export function RangeEditor({
  range,
  onChange,
  onDelete,
  gridScale,
  isCustom,
  isEditing,
}: {
  range: Range;
  gridScale: GridScale;
  onChange?: (range: Range) => void;
  onDelete?: () => void;
  isCustom?: boolean;
  isEditing?: boolean;
}) {
  const [theme] = useState(() => getStoredTheme());

  function addRing() {
    const maxRadius = Math.max(...range.rings.map((r) => r.radius));
    onChange?.({
      ...range,
      rings: [
        ...range.rings,
        {
          name: `Ring ${range.rings.length + 1}`,
          radius: maxRadius + 1,
          id: crypto.randomUUID(),
        },
      ],
    });
  }

  return (
    <Stack gap={1} sx={{ overflowY: "auto", pb: 0.5 }}>
      <Box sx={{ flexGrow: 1 }}>
        <List disablePadding>
          {range.rings.map((ring, i, rings) => {
            const color = theme.colors[i % theme.colors.length];
            return (
              <RingItem
                key={ring.id}
                ring={ring}
                color={color}
                complete={(i + 1) / rings.length}
                gridScale={gridScale}
                iconRadius={i + 1}
                ringIndex={i}
                onChange={
                  onChange
                    ? (ring) => {
                        const newRings = [...rings];
                        newRings[i] = ring;
                        onChange?.({ ...range, rings: newRings });
                      }
                    : undefined
                }
                onDelete={
                  onChange
                    ? () => {
                        const newRings = [...rings];
                        newRings.splice(i, 1);
                        onChange?.({ ...range, rings: newRings });
                      }
                    : undefined
                }
              />
            );
          })}
        </List>
      </Box>
      {onChange && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          onClick={addRing}
          startIcon={<AddRounded />}
        >
          Add Ring
        </Button>
      )}
      {onChange && <Controls range={range} onChange={onChange} />}
      {isCustom && isEditing && (
        <Button
          fullWidth
          size="small"
          onClick={onDelete}
          startIcon={<DeleteRounded />}
          color="error"
        >
          Delete
        </Button>
      )}
    </Stack>
  );
}

function Controls({
  range,
  onChange,
}: {
  range: Range;
  onChange: (range: Range) => void;
}) {
  return (
    <Stack direction="row" gap={2}>
      <FormControl>
        <SmallLabel id="name-label">Name</SmallLabel>
        <TextField
          aria-labelledby="name-label"
          value={range.name}
          onChange={(e) => onChange({ ...range, name: e.target.value })}
          size="small"
        />
      </FormControl>
      <FormControl sx={{ minWidth: 60 }}>
        <SmallLabel>Show Size</SmallLabel>
        <Switch
          sx={{ ml: 0, overflow: "visible" }}
          checked={!range.hideSize}
          onChange={(_, checked) => onChange({ ...range, hideSize: !checked })}
        />
      </FormControl>
      <RangeTypeButtonGroup
        value={range.type}
        onChange={(type) => {
          onChange({ ...range, type });
        }}
      />
    </Stack>
  );
}
