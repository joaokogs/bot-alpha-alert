import { Alert } from './alert';
import { AlertType } from '../value-objects/alert-type';
import type { PokemonName } from '../value-objects/pokemon-name';
import type { Timestamp } from '../value-objects/timestamp';

export class Swarm extends Alert {
  constructor(
    id: string,
    pokemonName: PokemonName,
    detectedAt: Timestamp,
    rawData: Record<string, string>,
    public readonly location: string,
    public readonly extraInfo: Record<string, string> = {},
  ) {
    super(id, AlertType.SWARM, pokemonName, detectedAt, rawData);
  }
}
