interface Point {
    x: number;
    y: number;
}
interface PencilElement {
    id: string;
    type: 'pencil';
    points: Point[];
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

interface TextElement {
    id: string;
    type: 'text';
    point: Point;
    strokeColor: string;
    fontSize: number;
    content: string;
}

interface RectangleElement {
    id: string;
    type: 'rectangle';
    point: Point;
    height: number;
    width: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

interface CircleElement {
    id: string;
    type: 'circle';
    center: Point;
    radius: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}


type DrawingElement =
    | PencilElement
    | TextElement
    | RectangleElement
    | CircleElement;


interface AddEventPayload {
    roomId: string;
    element: DrawingElement;
}

interface RemoveEventPayload {
    roomId: string;
    elementIds: string[];
}

interface UpdateEventPayload {
    roomId: string;
    elementIds: string;
    offsetX: number;
    offsetY: number;
}

interface PushEventPayload {
    roomId: string;
    elements: DrawingElement[];
}

interface PencilPreviewPayload {
    roomId: string;
    strokeId: string;
    type: 'pencil';
    point: Point;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

interface ShapePreviewPayload {
    roomId: string;
    strokeId: string;
    type: 'rectangle' | 'circle';
    startPoint: Point;
    currentPoint: Point;
    strokeColor: string;
    strokeWidth: number;
    strokeDash: string;
}

type PreviewPayload = PencilPreviewPayload | ShapePreviewPayload;
