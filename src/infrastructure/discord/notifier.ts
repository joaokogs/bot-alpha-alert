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
    console.log(`[Alpha Alert] Broadcasting to ${guilds.size} guild(s)...`);
    let sent = 0;

    for (const [guildId, guild] of guilds) {
      const channelId = this.configStore.getAlphaChannelId(guildId);
      if (!channelId) {
        console.log(`[Alpha Alert] Guild ${guild.name} (${guildId}): sem canal alpha configurado, pulando`);
        continue;
      }

      const roleMention = getRoleMention(this.configStore.getAlphaRoleId(guildId) ?? '');
      const roleMentionComponent = new TextDisplayBuilder().setContent(roleMention);
      const container = buildAlphaEmbed(alpha);

      try {
        const channel = this.client.channels.cache.get(channelId) as TextChannel | undefined;
        if (!channel) {
          console.log(`[Alpha Alert] Guild ${guild.name} (${guildId}): canal ${channelId} não encontrado no cache, pulando`);
          continue;
        }

        await channel.send({ components: [roleMentionComponent, container], flags: MessageFlags.IsComponentsV2 });
        console.log(`[Alpha Alert] Enviado para ${guild.name} (#${channel.name})`);
        sent++;
      } catch (error) {
        console.error(`[Alpha Alert] Erro ao enviar para guild ${guild.name} (${guildId}): ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (sent > 0) {
      console.log(`[Alpha Alert] ✅ ${alpha.pokemonName.toString()} enviado para ${sent} guild(s)`);
    } else {
      console.log(`[Alpha Alert] ⚠️ ${alpha.pokemonName.toString()} não foi enviado para nenhuma guild`);
    }
  }

  async notifyPheno(pheno: Pheno): Promise<void> {
    if (!this.client.isReady()) throw new DiscordNotReadyError();

    const guilds = this.client.guilds.cache;
    console.log(`[Pheno Alert] Broadcasting to ${guilds.size} guild(s)...`);
    let sent = 0;

    for (const [guildId, guild] of guilds) {
      const channelId = this.configStore.getPhenoChannelId(guildId);
      if (!channelId) {
        console.log(`[Pheno Alert] Guild ${guild.name} (${guildId}): sem canal pheno configurado, pulando`);
        continue;
      }

      const roleMention = getRoleMention(this.configStore.getPhenoRoleId(guildId) ?? '');
      const embed = buildPhenoEmbed(pheno);

      try {
        const channel = this.client.channels.cache.get(channelId) as TextChannel | undefined;
        if (!channel) {
          console.log(`[Pheno Alert] Guild ${guild.name} (${guildId}): canal ${channelId} não encontrado no cache, pulando`);
          continue;
        }

        await channel.send({ content: roleMention || undefined, embeds: [embed] });
        console.log(`[Pheno Alert] Enviado para ${guild.name} (#${channel.name})`);
        sent++;
      } catch (error) {
        console.error(`[Pheno Alert] Erro ao enviar para guild ${guild.name} (${guildId}): ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (sent > 0) {
      console.log(`[Pheno Alert] ✅ ${pheno.pokemonName.toString()} enviado para ${sent} guild(s)`);
    } else {
      console.log(`[Pheno Alert] ⚠️ ${pheno.pokemonName.toString()} não foi enviado para nenhuma guild`);
    }
  }

  async notifySwarm(swarm: Swarm): Promise<void> {
    if (!this.client.isReady()) throw new DiscordNotReadyError();

    const guilds = this.client.guilds.cache;
    console.log(`[Swarm Alert] Broadcasting to ${guilds.size} guild(s)...`);
    let sent = 0;

    for (const [guildId, guild] of guilds) {
      const channelId = this.configStore.getSwarmChannelId(guildId);
      if (!channelId) {
        console.log(`[Swarm Alert] Guild ${guild.name} (${guildId}): sem canal swarm configurado, pulando`);
        continue;
      }

      const roleMention = getRoleMention(this.configStore.getSwarmRoleId(guildId) ?? '');
      const roleMentionComponent = new TextDisplayBuilder().setContent(roleMention);
      const container = buildSwarmEmbed(swarm);

      try {
        const channel = this.client.channels.cache.get(channelId) as TextChannel | undefined;
        if (!channel) {
          console.log(`[Swarm Alert] Guild ${guild.name} (${guildId}): canal ${channelId} não encontrado no cache, pulando`);
          continue;
        }

        await channel.send({ components: [roleMentionComponent, container], flags: MessageFlags.IsComponentsV2 });
        console.log(`[Swarm Alert] Enviado para ${guild.name} (#${channel.name})`);
        sent++;
      } catch (error) {
        console.error(`[Swarm Alert] Erro ao enviar para guild ${guild.name} (${guildId}): ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (sent > 0) {
      console.log(`[Swarm Alert] ✅ ${swarm.pokemonName.toString()} enviado para ${sent} guild(s)`);
    } else {
      console.log(`[Swarm Alert] ⚠️ ${swarm.pokemonName.toString()} não foi enviado para nenhuma guild`);
    }
  }
}
