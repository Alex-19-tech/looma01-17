import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

interface MetricsDateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const PRESET_RANGES = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
  { label: "90 Days", value: "90days" },
  { label: "Custom", value: "custom" }
];

export default function MetricsDateFilter({ dateRange, onDateRangeChange }: MetricsDateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState("30days");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const now = new Date();
    
    switch (preset) {
      case "today":
        onDateRangeChange({
          from: startOfDay(now),
          to: endOfDay(now)
        });
        break;
      case "7days":
        onDateRangeChange({
          from: subDays(now, 7),
          to: now
        });
        break;
      case "30days":
        onDateRangeChange({
          from: subDays(now, 30),
          to: now
        });
        break;
      case "90days":
        onDateRangeChange({
          from: subDays(now, 90),
          to: now
        });
        break;
      case "custom":
        setIsCalendarOpen(true);
        break;
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESET_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: dateRange.from,
              to: dateRange.to
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange({
                  from: startOfDay(range.from),
                  to: endOfDay(range.to)
                });
                setSelectedPreset("custom");
                setIsCalendarOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}