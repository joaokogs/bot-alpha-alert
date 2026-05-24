import type { ChatInputCommandInteraction } from 'discord.js';
import type { ConfigStore } from '../../services/config-store';
import { hasAdminPermission, buildNoPermissionEmbed } from '../permissions';
import { buildSuccessEmbed } from '../embeds';

export type ChannelType = 'alpha' | 'pheno' | 'swarm';

const LABEL_MAP: Record<ChannelType, string> = {
  alpha: 'Alpha',
  pheno: 'Pheno',
  swarm: 'Swarm',
};

export async function handleSetChannel(
  interaction: ChatInputCommandInteraction,
  configStore: ConfigStore,
  type: ChannelType,
): Promise<void> {
  if (!hasAdminPermission(interaction)) {
    await interaction.reply({
      embeds: [buildNoPermissionEmbed()],
      ephemeral: true,
    });
    return;
  }

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({
      content: 'Este comando só pode ser usado em um servidor.',
      ephemeral: true,
    });
    return;
  }

  const channelId = interaction.channelId;

  const updateKey = `${type}ChannelId` as const;
  configStore.updateGuildConfig(guildId, { [updateKey]: channelId });

  const channel = interaction.guild?.channels.cache.get(channelId);
  const label = LABEL_MAP[type];

  const embed = buildSuccessEmbed(
    `Canal de ${label} definido com sucesso`,
    `Os alertas de ${label} agora serão enviados no canal ${channel?.toString() ?? `<#${channelId}>`} neste servidor.`,
  );

  await interaction.reply({ embeds: [embed] });
}
