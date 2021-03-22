import Events from 'events';
import TerminalController from './client/src/terminalController';

const componentEmitter = new Events();
const controller = new TerminalController();

await controller.initializeTable(componentEmitter);
