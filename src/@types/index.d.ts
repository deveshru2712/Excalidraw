type Tool = "pencil" | "eraser" | "text";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  type: Tool;
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
}
