import { Minus, Plus } from "lucide-react";

import Button from "@/components/ui/button";
import { useDrawingStore } from "@/stores/useDrawingStore";

export default function ZoomMenu() {
  const { setZoomDirection, zoomLevel } = useDrawingStore();

  return (
    <div className="fixed bottom-2 left-2 z-50 flex items-center gap-0.5 rounded-md border bg-white p-0.5 shadow">
      <Button
        onClick={() => setZoomDirection("out")}
        className="cursor-pointer"
        variant="ghost"
      >
        <Minus className="size-4" />
      </Button>

      <div className="text-xs font-semibold">
        {" "}
        {Math.round(zoomLevel * 100)}%
      </div>

      <Button
        onClick={() => setZoomDirection("in")}
        className="cursor-pointer"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
