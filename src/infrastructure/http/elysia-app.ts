import { Elysia } from 'elysia';
import { node } from '@elysia/node';
import type { Client } from 'discord.js';
import type { StatusService } from '../../application/services/status-service';
import type { DiscordNotifier } from '../../domain/ports/discord-port';
import type { ConfigStore } from '../services/config-store';
import { webhookRoutes } from '../services/webhook';

export function createElysiaApp(
  statusService: StatusService,
  notifier?: DiscordNotifier,
  discordClient?: Client,
  configStore?: ConfigStore,
): Elysia {
  const app = new Elysia({ adapter: node() });
  app.get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  app.get('/status', () => statusService.getStatus());

  // Diagnóstico: mostra guilds e configurações
  app.get('/debug/guilds', () => {
    if (!discordClient || !configStore) {
      return { error: 'Discord client or ConfigStore not available' };
    }

    const guilds = discordClient.guilds.cache.map((guild) => {
      const config = configStore.getGuildConfig(guild.id);
      return {
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        channels: {
          alpha: config.alphaChannelId ?? null,
          pheno: config.phenoChannelId ?? null,
          swarm: config.swarmChannelId ?? null,
        },
        roles: {
          alpha: config.alphaRoleId ?? null,
          pheno: config.phenoRoleId ?? null,
          swarm: config.swarmRoleId ?? null,
        },
      };
    });

    return {
      totalGuilds: guilds.length,
      discordReady: discordClient.isReady(),
      guilds,
    };
  });

  webhookRoutes(app, notifier, discordClient);

  return app;
}
