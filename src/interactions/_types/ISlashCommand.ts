import type { IShardClient } from '@type/IShardClient';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { CommandInteraction } from 'eris';

export interface ISlashCommand {
    commandName: string;
    aliases?: string[];
    handle: (logger: ILoggerService, shardClient: IShardClient, interaction: CommandInteraction) => Promise<void>;
}
