import { REST, Routes, type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { setChannelAlphaCommand, setChannelPhenoCommand, setChannelSwarmCommand, setRoleAlphaCommand, setRolePhenoCommand, setRoleSwarmCommand } from './config-commands';

interface RegisterCommandsOptions {
  token: string;
  clientId: string;
  guildId?: string;
}

export async function registerCommands(options: RegisterCommandsOptions): Promise<void> {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [
    setChannelAlphaCommand.toJSON(),
    setChannelPhenoCommand.toJSON(),
    setChannelSwarmCommand.toJSON(),
    setRoleAlphaCommand.toJSON(),
    setRolePhenoCommand.toJSON(),
    setRoleSwarmCommand.toJSON(),
  ];

  const rest = new REST({ version: '10' }).setToken(options.token);

  try {
    if (options.guildId) {
      console.log(`[Commands] Registering ${commands.length} guild commands...`);
      await rest.put(
        Routes.applicationGuildCommands(options.clientId, options.guildId),
        { body: commands },
      );
      console.log('[Commands] Guild commands registered successfully');
    } else {
      console.log(`[Commands] Registering ${commands.length} global commands...`);
      await rest.put(
        Routes.applicationCommands(options.clientId),
        { body: commands },
      );
      console.log('[Commands] Global commands registered successfully');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Commands] Failed to register commands: ${message}`);
  }
}
