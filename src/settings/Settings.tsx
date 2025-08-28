import { useEffect, useState } from "react";
import { defaultRanges, Range } from "../ranges/ranges";
import { RangeEditor } from "./RangeEditor";
import Stack from "@mui/material/Stack";
import { RangeSelector } from "./RangeSelector";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import OBR, { type GridScale } from "@owlbear-rodeo/sdk";

export function Settings() {
  const [range, setRange] = useState<Range>(() => defaultRanges[0]);
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
      <Stack>
        <RangeSelector selectedRange={range} setSelectedRange={setRange} />
        <RangeEditor range={range} onChange={setRange} gridScale={gridScale} />
      </Stack>
    </Stack>
  );
}
