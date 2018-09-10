/**
 * Object of commands (key) and the function they execute (value).
 *
 * @type {Object}
 */
const commands = {};


/**
 * Add commands and the functions they execute to object of commands.
 *
 * @param command
 * @param runFunction
 */
export function onMessage(command, runFunction) {

    commands[command] = runFunction;

}


/**
 * Handle message event.
 * Execute function attached to the given command and pass the provided data to it.
 *
 * @param {Event} event
 */
export default function handleMessage(event) {

    if (event.data.messageCommand) {

        const command = event.data.messageCommand;
        const data = event.data.messageData;

        if (command in commands) {
            commands[command](data);
        }

    }

}
