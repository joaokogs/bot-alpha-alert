import { TextChannel, MessageFlags, TextDisplayBuilder } from 'discord.js';
import type { Client } from 'discord.js';
import type { Alpha } from '../../domain/entities/alpha';
import type { Pheno } from '../../domain/entities/pheno';
import type { Swarm } from '../../domain/entities/swarm';
import type { DiscordNotifier } from '../../domain/ports/discord-port';
import type { ConfigStore } from '../services/config-store';
import { DiscordNotReadyError } from '../../application/errors/discord-error';
import { buildAlphaEmbed, buildPhenoEmbed, buildSwarmEmbed } from './embeds';
import { getRoleMention } from './roles';

export class DiscordBotNotifier implements DiscordNotifier {
  constructor(
    private readonly client: Client,
    private readonly configStore: ConfigStore,
  ) {}

  isReady(): boolean {
    return this.client.isReady();
  }

  /* ─── Broadcast para todas as guilds ─── */

  async notifyAlpha(alpha: Alpha): Promise<void> {
    if (!this.client.isReady()) throw new DiscordNotReadyError();

    const guilds = this.client.guilds.cache;
    let sent = 0;

    for (const [guildId] of guilds) {
      const channelId = this.configStore.getAlphaChannelId(guildId);
      if (!channelId) continue; // guild não configurou canal alpha

      const roleMention = getRoleMention(this.configStore.getAlphaRoleId(guildId) ?? '');
      const roleMentionComponent = new TextDisplayBuilder().setContent(roleMention);
      const container = buildAlphaEmbed(alpha);

      try {
        const channel = this.client.channels.cache.get(channelId) as TextChannel | undefined;
        if (!channel) continue;

        await channel.send({ components: [roleMentionComponent, container], flags: MessageFlags.IsComponentsV2 });
        sent++;
      } catch (error) {
        console.error(`[Alpha Alert] Failed to send to guild ${guildId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (sent > 0) {
      console.log(`[Alpha Alert] Sent notification for ${alpha.pokemonName.toString()} to ${sent} guild(s)`);
    }
  }

  async notifyPheno(pheno: Pheno): Promise<void> {
    if (!this.client.isReady()) throw new DiscordNotReadyError();

    const guilds = this.client.guilds.cache;
    let sent = 0;

    for (const [guildId] of guilds) {
      const channelId = this.configStore.getPhenoChannelId(guildId);
      if (!channelId) continue;

      const roleMention = getRoleMention(this.configStore.getPhenoRoleId(guildId) ?? '');
      const embed = buildPhenoEmbed(pheno);

      try {
        const channel = this.client.channels.cache.get(channelId) as TextChannel | undefined;
        if (!channel) continue;

        await channel.send({ content: roleMention || undefined, embeds: [embed] });
        sent++;
      } catch (error) {
        console.error(`[Pheno Alert] Failed to send to guild ${guildId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (sent > 0) {
      console.log(`[Pheno Alert] Sent notification for ${pheno.pokemonName.toString()} to ${sent} guild(s)`);
    }
  }

  async notifySwarm(swarm: Swarm): Promise<void> {
    if (!this.client.isReady()) throw new DiscordNotReadyError();

    const guilds = this.client.guilds.cache;
    let sent = 0;

    for (const [guildId] of guilds) {
      const channelId = this.configStore.getSwarmChannelId(guildId);
      if (!channelId) continue;

      const roleMention = getRoleMention(this.configStore.getSwarmRoleId(guildId) ?? '');
      const roleMentionComponent = new TextDisplayBuilder().setContent(roleMention);
      const container = buildSwarmEmbed(swarm);

      try {
        const channel = this.client.channels.cache.get(channelId) as TextChannel | undefined;
        if (!channel) continue;

        await channel.send({ components: [roleMentionComponent, container], flags: MessageFlags.IsComponentsV2 });
        sent++;
      } catch (error) {
        console.error(`[Swarm Alert] Failed to send to guild ${guildId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (sent > 0) {
      console.log(`[Swarm Alert] Sent notification for ${swarm.pokemonName.toString()} to ${sent} guild(s)`);
    }
  }
}
