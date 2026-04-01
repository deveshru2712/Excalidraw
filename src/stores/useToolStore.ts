import { create } from "zustand";

interface toolsStoreState {
  tool: Tool;
  strokeWidth: number;
  strokeColor: string;
  strokeStyle: "solid" | "dashed" | "dotted";
}

interface toolStoreAction {
  setTool: (tool: Tool) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeColor: (color: string) => void;
  setStrokeStyle: (style: "solid" | "dashed" | "dotted") => void;
}

type toolStoreType = toolsStoreState & toolStoreAction;

export const useToolStore = create<toolStoreType>((set) => ({
  tool: "pencil",
  strokeWidth: 4,
  strokeColor: "black",
  strokeStyle: "solid",
  setTool: (tool) => set({ tool }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeStyle: (style) => set({ strokeStyle: style }),
}));
