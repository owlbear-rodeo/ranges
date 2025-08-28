import { useEffect, useState } from "react";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { defaultRanges, getCustomRanges, Range } from "../ranges/ranges";

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

export function RangeSelector({
  selectedRange,
  setSelectedRange,
}: {
  selectedRange: Range;
  setSelectedRange: (range: Range) => void;
}) {
  const [customRanges] = useCustomRanges();
  const ranges = [...defaultRanges, ...customRanges];

  return (
    <Select
      value={selectedRange.id}
      onChange={(event) => {
        const range = ranges.find((range) => range.id === event.target.value);
        if (range) {
          setSelectedRange(range);
        }
      }}
      size="small"
    >
      {ranges.map((range) => (
        <MenuItem key={range.id} value={range.id}>
          {range.name}
        </MenuItem>
      ))}
    </Select>
  );
}
