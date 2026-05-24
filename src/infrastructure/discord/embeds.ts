import { EmbedBuilder, ContainerBuilder, SectionBuilder, SeparatorBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';
import type { Alpha } from '../../domain/entities/alpha';
import type { Pheno } from '../../domain/entities/pheno';
import type { Swarm } from '../../domain/entities/swarm';
import type { APIEmbedField } from 'discord.js';
import { ALPHA_COLOR, PHENO_COLOR, SWARM_COLOR, COMMAND_SUCCESS_COLOR, COMMAND_ERROR_COLOR, ALPHA_SITE_URL } from '../../config/constants';

const SPRITE_BASE_URL = 'https://img.pokemondb.net/sprites/black-white/anim/normal';
const ABILITY_DESCRIPTIONS: Record<string, string> = {
  'Vital Spirit': 'Imune a Sleep',
};

function getPokemonSpriteUrl(name: string): string {
  const normalized = name.toLowerCase().replace(/\s+/g, '-');
  return `${SPRITE_BASE_URL}/${normalized}.gif`;
}

function formatDespawn(despawnTimestamp: number | undefined): string {
  if (!despawnTimestamp) return 'Desconhecido';
  return `<t:${Math.floor(despawnTimestamp)}:R>`;
}

function formatHMs(raw: string): string {
  if (!raw || raw.trim() === '') return 'Nenhum';
  return raw;
}

function formatMaleRatio(raw: string): string {
  if (!raw || raw.trim() === '') return '';
  const cleaned = raw.trim().replace(/%$/, '');
  return `${cleaned}%`;
}

function formatAbility(raw: string): string {
  if (!raw || raw.includes(' - ')) return raw;
  const description = ABILITY_DESCRIPTIONS[raw.trim()];
  return description ? `${raw} - ${description}` : raw;
}

function quoteBlock(lines: string[]): string {
  return lines.map(line => `> ${line}`).join('\n');
}

function codeBlock(lines: string[]): string {
  return ['```', ...lines, '```'].join('\n');
}

function formatSource(publishedBy: string): string {
  return `-# Fonte: [Alphapedia by FlaProGmr & LordDusk](${ALPHA_SITE_URL})${publishedBy ? ` | Publicado por ${publishedBy}` : ''}`;
}

export function buildAlphaEmbed(alpha: Alpha): ContainerBuilder {
  const name = alpha.pokemonName.toString();
  const data = alpha.extraInfo as Record<string, string>;

  const region = data['Region'] || 'Desconhecida';
  const locationNotes = data['Location Notes'] ? ` (**${data['Location Notes']}**)` : '';
  const location = `${alpha.location}${locationNotes}`;
  const hms = formatHMs(data['HMs'] ?? '');
  const maleRatio = formatMaleRatio(data['Male Ratio'] ?? '');
  const eggGroup = data['Egg Group'] ?? '';
  const ability = formatAbility(data['Ability'] ?? '');
  const despawnTs = data['despawnTimestamp'] ? Number(data['despawnTimestamp']) : undefined;
  const publishedBy = data['publishedBy'] ?? '';

  const locationBlock = quoteBlock([
    `**Região**: ${region}`,
    `**Localização**: ${location}`,
    `**HMs Necessários**: ${hms}`,
  ]);

  const infoLines: string[] = [];
  if (maleRatio) infoLines.push(`**Taxa masculina**: ${maleRatio}`);
  if (eggGroup) infoLines.push(`**Egg Group**: ${eggGroup}`);
  if (ability) infoLines.push(`**Habilidade**: ${ability}`);
  infoLines.push(`**Desaparece aproximadamente**: ${formatDespawn(despawnTs)}`);

  const container = new ContainerBuilder().setAccentColor(ALPHA_COLOR);

  container.addSectionComponents(section =>
    section
      .addTextDisplayComponents(
        td => td.setContent(`## Alpha ${name}`),
        td => td.setContent(locationBlock),
      )
      .setThumbnailAccessory(thumb => thumb.setURL(getPokemonSpriteUrl(name)))
  );
  container.addSeparatorComponents(separator => separator);
  container.addTextDisplayComponents(td =>
    td.setContent(`**Informações**\n\n${quoteBlock(infoLines)}`)
  );

  if (alpha.moves.length > 0) {
    container.addSeparatorComponents(separator => separator);
    container.addTextDisplayComponents(td =>
      td.setContent(`**Movimentos**\n\n${codeBlock(alpha.moves.map(m => `- ${m}`))}`)
    );
  }

  container.addSeparatorComponents(separator => separator);
  container.addTextDisplayComponents(td => td.setContent(formatSource(publishedBy)));

  return container;
}

export function buildPhenoEmbed(pheno: Pheno): EmbedBuilder {
  const title = pheno.isShiny
    ? `Shiny Pheno ${pheno.pokemonName.toString()} Detectado!`
    : `Pheno ${pheno.pokemonName.toString()} Detectado!`;

  const embed = new EmbedBuilder()
    .setColor(PHENO_COLOR)
    .setTitle(title)
    .addFields(
      { name: 'Variant', value: pheno.variant, inline: true },
      { name: 'Ability', value: pheno.ability, inline: true },
      { name: 'Location', value: pheno.location, inline: true },
      { name: 'Shiny', value: pheno.isShiny ? 'Yes' : 'No', inline: true },
    )
    .setTimestamp(pheno.detectedAt.toDate())
    .setFooter({ text: 'Pokemmo Pheno Alert Bot' });

  for (const [key, value] of Object.entries(pheno.extraInfo)) {
    if (key && value) {
      embed.addFields({ name: key, value, inline: true });
    }
  }

  return embed;
}

export function buildSwarmEmbed(swarm: Swarm): ContainerBuilder {
  const name = swarm.pokemonName.toString();
  const data = swarm.extraInfo as Record<string, string>;

  const region = data['Region'] || 'Desconhecida';
  const locationNotes = data['Location Notes'] ? ` (**${data['Location Notes']}**)` : '';
  const location = `${swarm.location}${locationNotes}`;
  const hms = formatHMs(data['HMs'] ?? '');
  const despawnTs = data['despawnTimestamp'] ? Number(data['despawnTimestamp']) : undefined;
  const publishedBy = data['publishedBy'] ?? '';

  const locationBlock = quoteBlock([
    `**Região**: ${region}`,
    `**Localização**: ${location}`,
    `**HMs Necessários**: ${hms}`,
  ]);

  const container = new ContainerBuilder().setAccentColor(SWARM_COLOR);

  container.addSectionComponents(section =>
    section
      .addTextDisplayComponents(
        td => td.setContent(`## Swarm ${name}`),
        td => td.setContent(locationBlock),
      )
      .setThumbnailAccessory(thumb => thumb.setURL(getPokemonSpriteUrl(name)))
  );
  container.addSeparatorComponents(separator => separator);
  container.addTextDisplayComponents(td =>
    td.setContent(`**Informações**\n\n${quoteBlock([`**Desaparece aproximadamente**: ${formatDespawn(despawnTs)}`])}`)
  );
  container.addSeparatorComponents(separator => separator);
  container.addTextDisplayComponents(td => td.setContent(formatSource(publishedBy)));

  return container;
}

export function buildSuccessEmbed(
  title: string,
  description: string,
  fields?: APIEmbedField[],
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COMMAND_SUCCESS_COLOR)
    .setTitle(title)
    .setDescription(description);

  if (fields && fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

export function buildErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COMMAND_ERROR_COLOR)
    .setTitle(title)
    .setDescription(description);
}
