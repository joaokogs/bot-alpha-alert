import { Client, GatewayIntentBits } from 'discord.js';
import type { ConfigStore } from '../services/config-store';
import { handleSetChannel, handleSetRole, handleRoleAutocomplete } from './commands';
import type { ChannelType, RoleType } from './commands';

const CHANNEL_COMMANDS: Record<string, ChannelType> = {
  setchannelalpha: 'alpha',
  setchannelpheno: 'pheno',
  setchannelswarm: 'swarm',
};

const ROLE_COMMANDS: Record<string, RoleType> = {
  setrolealpha: 'alpha',
  setrolepheno: 'pheno',
  setroleswarm: 'swarm',
};

export interface CreateDiscordClientOptions {
  token: string;
  configStore: ConfigStore;
  allowedGuilds: string[];
}

export async function createDiscordClient(options: CreateDiscordClientOptions): Promise<Client> {
  const { token, configStore, allowedGuilds } = options;

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.on('error', (error: Error) => {
    console.error('[Discord] Client error:', error.message);
  });

  client.on('warn', (warning: string) => {
    console.warn('[Discord] Warning:', warning);
  });

  /* ─── Autorização de servidores ─── */

  async function leaveUnauthorizedGuild(guildId: string, reason: string): Promise<void> {
    console.warn(`[Discord] ${reason} — saindo do servidor ${guildId}`);
    try {
      const guild = client.guilds.cache.get(guildId) ?? await client.guilds.fetch(guildId);
      if (guild) {
        await guild.leave();
        console.log(`[Discord] Saí do servidor ${guild.name} (${guildId})`);
      }
    } catch (err) {
      console.error(`[Discord] Erro ao sair do servidor ${guildId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function isGuildAllowed(guildId: string): boolean {
    if (allowedGuilds.length === 0) return false; // sem lista = sem acesso
    return allowedGuilds.includes(guildId);
  }

  // Ao ser convidado para um novo servidor
  client.on('guildCreate', async (guild) => {
    if (!isGuildAllowed(guild.id)) {
      await leaveUnauthorizedGuild(guild.id, `Servidor não autorizado: ${guild.name} (${guild.id})`);
    } else {
      console.log(`[Discord] Entrei no servidor autorizado: ${guild.name} (${guild.id})`);
    }
  });

  // Ao ser removido de um servidor
  client.on('guildDelete', (guild) => {
    console.log(`[Discord] Fui removido do servidor: ${guild.name ?? guild.id}`);
  });

  /* ─── Comandos ─── */

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      try {
        // Só processa comandos em guilds autorizadas
        if (interaction.guildId && !isGuildAllowed(interaction.guildId)) {
          await interaction.reply({
            content: 'Este servidor não está autorizado a usar este bot.',
            ephemeral: true,
          });
          return;
        }

        const channelType = CHANNEL_COMMANDS[interaction.commandName];
        if (channelType) {
          await handleSetChannel(interaction, configStore, channelType);
          return;
        }

        const roleType = ROLE_COMMANDS[interaction.commandName];
        if (roleType) {
          await handleSetRole(interaction, configStore, roleType);
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Discord] Error handling command ${interaction.commandName}: ${message}`);

        const reply = {
          content: 'Ocorreu um erro ao processar o comando. Tente novamente.',
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }

    if (interaction.isAutocomplete()) {
      if (
        interaction.commandName === 'setrolealpha' ||
        interaction.commandName === 'setrolepheno' ||
        interaction.commandName === 'setroleswarm'
      ) {
        try {
          await handleRoleAutocomplete(interaction);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[Discord] Error handling autocomplete: ${message}`);
        }
      }
    }
  });

  return new Promise<Client>((resolve, reject) => {
    client.once('ready', () => {
      console.log(`[Discord] Logged in as ${client.user?.tag ?? 'unknown'}`);
      console.log(`[Discord] Servidores autorizados: ${allowedGuilds.length > 0 ? allowedGuilds.join(', ') : 'NENHUM'}`);

      // Verifica servidores existentes ao iniciar
      const guilds = client.guilds.cache;
      for (const [id, guild] of guilds) {
        if (!isGuildAllowed(id)) {
          console.warn(`[Discord] Servidor não autorizado encontrado no startup: ${guild.name} (${id}) — saindo...`);
          guild.leave().catch((err) => {
            console.error(`[Discord] Erro ao sair de ${id}: ${err.message}`);
          });
        }
      }

      resolve(client);
    });

    client.login(token).catch(reject);
  });
}
