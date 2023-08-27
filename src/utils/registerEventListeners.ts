import config from 'config';
import fs from 'node:fs';
import path from 'node:path';

import loggerModule from '../services/logger';
import { LoggerOptions } from '../types/configTypes';
import {
    ClientEventArguments, PlayerEventArguments, ProcessEventArguments
} from '../types/eventTypes';
import { RegisterEventListenersParams } from '../types/utilTypes';

const loggerOptions: LoggerOptions = config.get('loggerOptions');

export const registerEventListeners = ({ client, player, executionId }: RegisterEventListenersParams) => {
    const logger = loggerModule.child({
        source: 'registerEventListeners.js',
        module: 'register',
        name: 'registerEventListeners',
        executionId: executionId,
        shardId: client.shard?.ids[0]
    });

    logger.debug('Registering event listeners...');

    const eventFolders = fs.readdirSync(path.resolve('./dist/events'));
    for (const folder of eventFolders) {
        logger.trace(`Registering event listener for folder '${folder}'...`);

        const eventFiles = fs
            .readdirSync(path.resolve(`./dist/events/${folder}`))
            .filter((file) => file.endsWith('.js'));

        for (const file of eventFiles) {
            /* eslint-disable @typescript-eslint/no-var-requires */
            const event = require(`../events/${folder}/${file}`);
            switch (folder) {
                case 'client':
                    if (event.once) {
                        client.once(event.name, (...args: ClientEventArguments) => event.execute(...args));
                    } else {
                        if (!event.isDebug || process.env.MINIMUM_LOG_LEVEL === 'debug') {
                            client.on(event.name, (...args: ClientEventArguments) => event.execute(...args));
                        }
                    }
                    break;

                case 'interactions':
                    client.on(event.name, (...args: ClientEventArguments) => event.execute(...args, { client }));
                    break;

                case 'process':
                    process.on(event.name, (...args: ProcessEventArguments) => event.execute(...args));
                    break;

                case 'player':
                    if (
                        !event.isDebug ||
                        (loggerOptions.minimumLogLevel === 'debug' && loggerOptions.discordPlayerDebug)
                    ) {
                        if (event.isPlayerEvent) {
                            player.events.on(event.name, (...args: PlayerEventArguments) => event.execute(...args));
                            break;
                        } else {
                            player.on(event.name, (...args: PlayerEventArguments) => event.execute(...args));
                        }
                    }
                    break;

                default:
                    logger.error(`Unknown event folder '${folder}' while trying to register events.`);
            }
        }
    }

    logger.trace('Registering event listeners complete.');
};