import type { CheerioAPI } from 'cheerio';
import { Pheno } from '../../domain/entities/pheno';
import { PokemonName } from '../../domain/value-objects/pokemon-name';
import { Timestamp } from '../../domain/value-objects/timestamp';
import { ParseError } from '../../application/errors/alert-error';

export class PhenoParser {
  parse($: CheerioAPI): Pheno[] {
    const phenos: Pheno[] = [];

    try {
      const rows = $(
        '.pheno-row, .pheno-entry, [data-type="pheno"], #pheno-table tr, table.pheno-table tr',
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

        const variant =
          rawData['col_1'] ||
          $row.find('.variant, [data-field="variant"]').text().trim() ||
          'Normal';

        const shinyRaw =
          rawData['col_2'] ||
          $row.find('.shiny, [data-field="shiny"]').text().trim() ||
          '';

        const isShiny = /yes|true|shiny|sim|✔|✓/i.test(shinyRaw);

        const ability =
          rawData['col_3'] ||
          $row.find('.ability, [data-field="ability"]').text().trim() ||
          'Unknown';

        const location =
          rawData['col_4'] ||
          $row.find('.location, [data-field="location"]').text().trim() ||
          'Unknown';

        const pokemonName = PokemonName.create(name);
        const safeName = pokemonName.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const safeVariant = variant.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const safeLocation = location.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const id = `pheno:${safeName}:${safeVariant}:${safeLocation}`;

        phenos.push(
          new Pheno(
            id,
            pokemonName,
            Timestamp.now(),
            rawData,
            variant,
            isShiny,
            ability,
            location,
            {},
          ),
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new ParseError('Failed to parse Pheno alerts', err);
    }

    return phenos;
  }
}
