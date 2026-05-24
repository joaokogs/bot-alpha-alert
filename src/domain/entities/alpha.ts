import { Alert } from './alert';
import { AlertType } from '../value-objects/alert-type';
import type { PokemonName } from '../value-objects/pokemon-name';
import type { Timestamp } from '../value-objects/timestamp';

export class Alpha extends Alert {
  constructor(
    id: string,
    pokemonName: PokemonName,
    detectedAt: Timestamp,
    rawData: Record<string, string>,
    public readonly level: number,
    public readonly location: string,
    public readonly moves: string[],
    public readonly extraInfo: Record<string, string> = {},
  ) {
    super(id, AlertType.ALPHA, pokemonName, detectedAt, rawData);
  }
}
