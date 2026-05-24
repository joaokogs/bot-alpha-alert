import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { COMMAND_ERROR_COLOR } from '../../config/constants';

export function hasAdminPermission(interaction: ChatInputCommandInteraction): boolean {
  const permissions = interaction.memberPermissions;
  if (!permissions) return false;
  return permissions.has(PermissionsBitField.Flags.ManageGuild);
}

export function buildNoPermissionEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COMMAND_ERROR_COLOR)
    .setTitle('Permissão negada')
    .setDescription('Você precisa da permissão **Administrador** ou **Gerenciar Servidor** para usar este comando.');
}
