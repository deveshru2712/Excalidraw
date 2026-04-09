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
