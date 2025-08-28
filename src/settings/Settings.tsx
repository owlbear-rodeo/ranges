import { useEffect, useState } from "react";
import { defaultRanges, getCustomRanges, Range } from "../ranges/ranges";
import { RangeEditor } from "./RangeEditor";
import Stack from "@mui/material/Stack";
import { RangeSelector } from "./RangeSelector";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import OBR, { type GridScale } from "@owlbear-rodeo/sdk";

function useCustomRanges() {
  const [customRanges, setCustomRanges] = useState<Range[]>(() =>
    getCustomRanges()
  );

  useEffect(() => {
    try {
      localStorage.setItem("ranges", JSON.stringify(customRanges));
    } catch (error) {
      console.warn("Failed to save custom ranges to localStorage:", error);
    }
  }, [customRanges]);

  return [customRanges, setCustomRanges] as const;
}

export function Settings() {
  const [selectedRange, setSelectedRange] = useState<Range>(
    () => defaultRanges[0]
  );
  const [editing, setEditing] = useState(false);
  const [customRanges, setCustomRanges] = useCustomRanges();
  const [storageIsAvailable] = useState(() => {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch (error) {
      return false;
    }
  });

  if (!storageIsAvailable) {
    return (
      <Alert severity="error" sx={{ height: "256px" }}>
        <AlertTitle>Storage is not available</AlertTitle>
        The plugin is unable to change the range. Please enable third-party
        cookies.
      </Alert>
    );
  }

  const [gridScale, setGridScale] = useState<GridScale | null>(null);
  useEffect(() => {
    let mounted = true;
    OBR.scene.grid.getScale().then((scale) => {
      if (mounted) {
        setGridScale(scale);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!gridScale) {
    return null;
  }

  return (
    <Stack sx={{ height: "256px", p: 1 }}>
      <RangeSelector
        selectedRange={selectedRange}
        onSelect={(range) => {
          setSelectedRange(range);
          setEditing(false);
        }}
        customRanges={customRanges}
        defaultRanges={defaultRanges}
        onAdd={(range) => {
          setCustomRanges([...customRanges, range]);
          setSelectedRange(range);
          setEditing(true);
        }}
        onEdit={() => {
          setEditing((prev) => !prev);
        }}
        isEditing={editing}
        isCustom={customRanges.some((r) => r.id === selectedRange.id)}
      />
      <RangeEditor
        range={selectedRange}
        onChange={editing ? setSelectedRange : undefined}
        gridScale={gridScale}
        isCustom={customRanges.some((r) => r.id === selectedRange.id)}
        isEditing={editing}
        onDelete={() => {
          setCustomRanges(
            customRanges.filter((range) => range.id !== range.id)
          );
        }}
      />
    </Stack>
  );
}
