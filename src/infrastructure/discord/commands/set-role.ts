import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import type { ConfigStore } from '../../services/config-store';
import { hasAdminPermission, buildNoPermissionEmbed } from '../permissions';
import { buildSuccessEmbed } from '../embeds';

export type RoleType = 'alpha' | 'pheno' | 'swarm';

export async function handleSetRole(
  interaction: ChatInputCommandInteraction,
  configStore: ConfigStore,
  type: RoleType,
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

  const role = interaction.options.getRole('role', true);

  const updateKey = `${type}RoleId` as const;
  configStore.updateGuildConfig(guildId, { [updateKey]: role.id });

  const roleLabelMap: Record<RoleType, string> = { alpha: 'Alpha', pheno: 'Pheno', swarm: 'Swarm' };
  const roleLabel = roleLabelMap[type];
  const embed = buildSuccessEmbed(
    `Cargo de ${roleLabel} definido com sucesso`,
    `O cargo ${role.toString()} será mencionado nos alertas de ${roleLabel} neste servidor.`,
  );

  await interaction.reply({ embeds: [embed] });
}

export async function handleRoleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const focused = interaction.options.getFocused(true);

  if (focused.name !== 'role') return;

  const guild = interaction.guild;
  if (!guild) {
    await interaction.respond([]);
    return;
  }

  const query = focused.value.toLowerCase();
  const choices = guild.roles.cache
    .filter((r) => r.id !== guild.id && !r.managed && r.name.toLowerCase().includes(query))
    .sort((a, b) => b.position - a.position)
    .first(25)
    .map((r) => ({ name: r.name, value: r.id }));

  await interaction.respond(choices);
}
