import { constants } from './constants.js';

export default class Controller {
    #users = new Map();
    #rooms = new Map();

    constructor({ socketServer }) {
        this.socketServer = socketServer;
    }

    onNewConnection(socket) {
        const { id } = socket;
        console.log('connection stablished with', id);
        const userData = { id, socket };
        this.#updateGlobalUserData(id, userData);

        socket.on('data', this.#onSocketData(id));
        socket.on('error', this.#onSocketClose(id));
        socket.on('end', this.#onSocketClose(id));
    }

    async joinRoom(socketId, data) {
        const userData = data;
        console.log(`${userData.userName} joined ${[socketId]}`);
        const { roomId } = userData;
        const user = this.#updateGlobalUserData(socketId, userData);

        const users = this.#joinUserRoom(roomId, user);

        const currentUsers = Array.from(users.values())
            .map(({ id, userName }) => ({ userName, id }));

        //atualiza o usuario que conectou sobre quais usuarios já estão na sala
        this.socketServer.sendMessage(user.socket, constants.event.UPDATE_USERS, currentUsers);

        //avisa a rede que um novo usuario se conectou
        this.broadcast({
            socketId,
            roomId,
            message: { id: socketId, userName: userData.userName },
            event: constants.event.NEW_USER_CONNECTED,
        });
    }

    broadcast({ socketId, roomId, event, message, includeCurrentSocket = false }) {
        const usersOnRoom = this.#rooms.get(roomId);

        for(const [ key, user ] of usersOnRoom) {
            if(!includeCurrentSocket && key === socketId) {
                continue;
            }

            this.socketServer.sendMessage(user.socket, event, message);

        }
    }

    #joinUserRoom(roomId, user) {
        const userOnRoom = this.#rooms.get(roomId) ?? new Map();
        userOnRoom.set(user.id, user);
        this.#rooms.set(roomId, userOnRoom);

        return userOnRoom;
    }

    #onSocketData(id) {
        return data => {
            try {
                const { event, message } = JSON.parse(data);
                this[event](id, message);
            } catch (err) {
                console.log('wrong event format!', data.toString());
            }

        };
    }

    #onSocketClose(id) {
        return data => {
            console.log('onSocketClosed', id);
        };
    }

    #updateGlobalUserData(socketId, userData) {
        const users = this.#users;
        const user = users.get(socketId) ?? {};

        const updateUserData = {
            ...user,
            ...userData
        };

        users.set(socketId, updateUserData);
        return users.get(socketId);
    }
}
