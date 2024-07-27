import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IShardClient } from '@core/_types/IShardClient';
import type { ISlashCommand } from '@interactions/_types/ISlashCommand';
import type { CommandInteraction } from 'eris';

export class HelpCommand implements ISlashCommand {
    public commandName = 'help';
    public aliases = ['h'];

    public async handle(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.commandName}' command...`);
        await _interaction.createMessage("Sorry, can't help ya");
    }
}

module.exports = new HelpCommand();
