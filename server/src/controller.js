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
        const userData = JSON.parse(data);
        console.log(`${userData.username} joined`, [socketId]);
        const { roomId } = userData;
        const users = this.#joinUserRoom(roomId, user);

        const user = this.#updateGlobalUserData(socketId, userData);
    }

    #joinUserRoom(roomId, user) {
        const userOnRoom = this.#rooms.get(roomId) ?? new Map();
        userOnRoom.set(user.id, user);
        this.#rooms.set(roomId, userOnRoom);

        //atualiza o usuario que conectou sobre quais usuarios já estão na sala
        this.socketServer.sendMessage(user.socket, constants.event.UPDATE_USERS);

        return userOnRoom;
    }

    #onSocketData(id) {
        return data => {
            console.log('onSocketData', data.toString());
        };
    }

    #onSocketClose(id) {
        return data => {
            console.log('onSocketClosed', data.toString());
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
