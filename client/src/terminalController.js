import ComponentsBuilder from './components.js';

export default class TerminalController {
    #usersColors = new Map();

    constructor() {}

    #pickCollor() {
        return `#` + ((1 << 24) * Math.random() | 0).toString(16) + '-fg';
    }


    #getUserColor(userName) {
        if(this.#usersColors.has(userName)) {
            return this.#usersColors.get(userName);
        }

        const color = this.#pickCollor();
        this.#usersColors.set(userName, color);

        return color;
    }

    #onInputReceived(eventEmitter) {
        return function () {
            const message = this.getValue();
            console.log(message);
            this.clearValue();
        }
    }

    #onMessageReceived({ screen, chat }) {
        return msg => {
            const { userName, message } = msg;
            const color = this.#getUserColor(userName);

            chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`);
            screen.render();
        };
    }

    #registerEvents(eventEmitter, components) {
        eventEmitter.on('message:received', this.#onMessageReceived(components))
    }

    async initializeTable(eventEmitter) {
        const components = new ComponentsBuilder()
            .setScreen({ title: 'HackerChat - João Mangueira' })
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))
            .setChatComponent()
            .build();

        this.#registerEvents(eventEmitter, components);

        components.input.focus();
        components.screen.render();

        setInterval(() => {
            eventEmitter.emit('message:received', { message: 'hello word!!', userName: 'joao' });
            eventEmitter.emit('message:received', { message: 'ta indo!', userName: 'priscila' });
        }, 2000);

    }
}
