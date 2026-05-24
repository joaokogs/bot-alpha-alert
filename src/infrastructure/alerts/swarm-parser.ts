import type { CheerioAPI } from 'cheerio';
import { Swarm } from '../../domain/entities/swarm';
import { PokemonName } from '../../domain/value-objects/pokemon-name';
import { Timestamp } from '../../domain/value-objects/timestamp';
import { ParseError } from '../../application/errors/alert-error';

export class SwarmParser {
  parse($: CheerioAPI): Swarm[] {
    const swarms: Swarm[] = [];

    try {
      const rows = $(
        '.swarm-row, .swarm-entry, [data-type="swarm"], #swarm-table tr, table.swarm-table tr',
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

        const location =
          rawData['col_1'] ||
          $row.find('.location, [data-field="location"]').text().trim() ||
          'Unknown';

        const pokemonName = PokemonName.create(name);
        const safeName = pokemonName.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const safeLocation = location.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const id = `swarm:${safeName}:${safeLocation}`;

        swarms.push(
          new Swarm(id, pokemonName, Timestamp.now(), rawData, location, {}),
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new ParseError('Failed to parse Swarm alerts', err);
    }

    return swarms;
  }
}
