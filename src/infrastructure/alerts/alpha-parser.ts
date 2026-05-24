import type { CheerioAPI } from 'cheerio';
import { Alpha } from '../../domain/entities/alpha';
import { PokemonName } from '../../domain/value-objects/pokemon-name';
import { Timestamp } from '../../domain/value-objects/timestamp';
import { ParseError } from '../../application/errors/alert-error';

export class AlphaParser {
  parse($: CheerioAPI): Alpha[] {
    const alphas: Alpha[] = [];

    try {
      const rows = $(
        '.alpha-row, .alpha-entry, [data-type="alpha"], #alpha-table tr, table.alpha-table tr',
      ).toArray();

      for (const row of rows) {
        const $row = $(row);
        const cells = $row.find('td, th, .cell, .data-cell').toArray();
        if (cells.length === 0) continue;

        const rawData: Record<string, string> = {};
        cells.forEach((cell, index) => {
          rawData[`col_${index}`] = $(cell).text().trim();
        });

        const name =
          rawData['col_0'] ||
          $row.find('.pokemon-name, .name, [data-field="name"]').text().trim() ||
          '';

        if (!name) continue;

        const levelRaw =
          rawData['col_1'] ||
          $row.find('.level, [data-field="level"]').text().trim() ||
          '0';

        const level = parseInt(levelRaw.replace(/\D/g, ''), 10) || 0;

        const location =
          rawData['col_2'] ||
          $row.find('.location, [data-field="location"]').text().trim() ||
          'Unknown';

        const movesRaw =
          rawData['col_3'] ||
          $row.find('.moves, [data-field="moves"]').text().trim() ||
          '';

        const moves = movesRaw
          ? movesRaw.split(/[,/|]/).map((m) => m.trim()).filter(Boolean)
          : [];

        const pokemonName = PokemonName.create(name);
        const safeName = pokemonName.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const safeLocation = location.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const id = `alpha:${safeName}:${level}:${safeLocation}`;

        alphas.push(
          new Alpha(id, pokemonName, Timestamp.now(), rawData, level, location, moves, {}),
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new ParseError('Failed to parse Alpha alerts', err);
    }

    return alphas;
  }
}
