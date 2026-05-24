import type { AlertType } from '../value-objects/alert-type';
import type { PokemonName } from '../value-objects/pokemon-name';
import type { Timestamp } from '../value-objects/timestamp';

export abstract class Alert {
  constructor(
    public readonly id: string,
    public readonly type: AlertType,
    public readonly pokemonName: PokemonName,
    public readonly detectedAt: Timestamp,
    public readonly rawData: Record<string, string>,
  ) {}

}
