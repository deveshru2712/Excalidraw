import { useEffect, useState } from 'react';

import { DoorOpen } from 'lucide-react';
import { useParams } from 'react-router';

import Button from '@/components/ui/button';

import CursorOverlay from '@/components/Canvas/CursorOverlay';
import ToolsMenu from '@/components/Canvas/ToolMenu';
import ToolSettingMenu from '@/components/Canvas/ToolSettingMenu';
import UtilsMenu from '@/components/Canvas/UtilsMenu';
import ZoomMenu from '@/components/Canvas/ZoomMenu';
import CollaborationCanvas from '@/components/Collaboration/CollaborationCanvas';
import CollaboratorsMenu from '@/components/Collaboration/CollaboratorsMenu';
import RoomNotFound from '@/components/Collaboration/RoomNotFound';
import SessionClosedOverlay from '@/components/Collaboration/SessionClosedOverlay';
import { socket } from '@/lib/socket';

export default function CollaborativePlayground() {
    const { roomId } = useParams();

    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState(false);
    const [overlayReason, setOverlayReason] =
        useState<ExitReason>('host-ended');
    const [isActualOwner] = useState(() => {
        const isOwner = localStorage.getItem('isRoomOwner') === 'true';
        const storedRoomId = localStorage.getItem('ownerRoomId');
        return isOwner && storedRoomId === roomId;
    });

    useEffect(() => {
        if (!roomId) return;

        if (!socket.connected) {
            socket.connect();
        }

        // clear the canvas
        localStorage.removeItem('drawing-store');

        if (isActualOwner) {
            socket.emit('register-room', { roomId, isOwner: isActualOwner });
        } else {
            socket.emit('join-room', { roomId });
        }

        const handleRoomClosed = () => {
            setIsActive(true);
            setOverlayReason('host-ended');
        };

        const handleRoomNotFound = () => {
            setError(true);
        };

        socket.on('room-shutdown', handleRoomClosed);
        socket.on('room-not-found', handleRoomNotFound);

        return () => {
            socket.off('room-shutdown', handleRoomClosed);
            socket.off('room-not-found', handleRoomNotFound);

            socket.emit('exit-room', { roomId });
        };
    }, [roomId]);

    if (error) {
        return <RoomNotFound />;
    }

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <Button
                onClick={() => {
                    setIsActive(true);
                    if (isActualOwner) {
                        setOverlayReason('host-ended');
                        // emit an event to un-register room and remove all the participants
                        socket.emit('close-room', {});
                    } else {
                        setOverlayReason('self-exit');
                        // listen for removal
                        socket.emit('exit-room', { roomId });
                    }
                    localStorage.removeItem('drawing-store');
                }}
                className="absolute top-5 right-5 flex w-fit items-center gap-0.5 rounded-sm"
            >
                <DoorOpen className="size-4" /> Exit
            </Button>
            <SessionClosedOverlay isActive={isActive} reason={overlayReason} />
            <ToolsMenu />
            <CollaborationCanvas roomId={roomId!} />
            <CollaboratorsMenu />
            <CursorOverlay />
            <ZoomMenu />
            <ToolSettingMenu />
            <UtilsMenu />
        </div>
    );
}
