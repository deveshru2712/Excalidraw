interface RegisterRoomPayload {
    roomId: string;
    isOwner: boolean;
}

interface JoinRoomPayload {
    roomId: string;
}

interface ExitingRoomPayload {
    roomId: string;
}

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
