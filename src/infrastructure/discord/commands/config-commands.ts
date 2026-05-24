import { SlashCommandBuilder } from 'discord.js';

export const setChannelAlphaCommand = new SlashCommandBuilder()
  .setName('setchannelalpha')
  .setDescription('Define o canal atual como o canal de alertas de Alpha');

export const setChannelPhenoCommand = new SlashCommandBuilder()
  .setName('setchannelpheno')
  .setDescription('Define o canal atual como o canal de alertas de Pheno');

export const setChannelSwarmCommand = new SlashCommandBuilder()
  .setName('setchannelswarm')
  .setDescription('Define o canal atual como o canal de alertas de Swarm');

export const setRoleAlphaCommand = new SlashCommandBuilder()
  .setName('setrolealpha')
  .setDescription('Define o cargo que será mencionado nos alertas de Alpha')
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('Cargo a ser mencionado nos alertas de Alpha')
      .setRequired(true),
  );

export const setRolePhenoCommand = new SlashCommandBuilder()
  .setName('setrolepheno')
  .setDescription('Define o cargo que será mencionado nos alertas de Pheno')
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('Cargo a ser mencionado nos alertas de Pheno')
      .setRequired(true),
  );

export const setRoleSwarmCommand = new SlashCommandBuilder()
  .setName('setroleswarm')
  .setDescription('Define o cargo que será mencionado nos alertas de Swarm')
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('Cargo a ser mencionado nos alertas de Swarm')
      .setRequired(true),
  );
