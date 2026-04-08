import { Server as Engine } from '@socket.io/bun-engine';

import 'dotenv/config';

import { Server } from 'socket.io';

const engine = new Engine({
    path: '/socket.io/',
});

const io = new Server({
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.bind(engine);

// stores a list of active rooms
// if a room is inactive a event is return that the room does not exists
const activeRooms = new Map<string, string>(); // roomId -> ownerId (socket.id)

io.on('connection', (socket) => {
    // socket.onAny((event, ...args) => {
    //     console.log(`[${socket.id}] event: ${event}`, args);
    // });

    console.log('a new user connected', socket.id);

    // send by the room owner to register as a active room
    socket.on('register-room', (data: RegisterRoomPayload) => {
        // joining the room
        socket.join(data.roomId);
        // save the info
        if (data.isOwner && !activeRooms.has(data.roomId)) {
            activeRooms.set(data.roomId, socket.id);
        }
        console.log('room is registered', data.roomId);
    });

    // for non-admin user to join the room
    socket.on('join-room', (data: JoinRoomPayload) => {
        const rooms = socket.rooms;
        if (!rooms.has(data.roomId)) {
            // only join if not already in room
            socket.join(data.roomId);
            console.log('a new user joins the room', socket.id);
        }
    });

    // for non-admin user exiting the room
    socket.on('exit-room', (data: ExitingRoomPayload) => {
        // client exits the room
        console.log('non-admin user left');
        socket.leave(data.roomId);
    });

    socket.on('close-room', () => {
        for (const [roomId, ownerId] of activeRooms.entries()) {
            if (ownerId === socket.id) {
                io.to(roomId).emit('room-shutdown');
                activeRooms.delete(roomId);
                break;
            }
        }
        console.log('room closed');
    });

    socket.on('disconnect', () => {
        for (const [roomId, ownerId] of activeRooms.entries()) {
            if (ownerId === socket.id) {
                io.to(roomId).emit('room-shutdown');
                activeRooms.delete(roomId);
                break;
            }
        }
    });
});

export default {
    port: 8080,
    ...engine.handler(),
};
