export class PokemonName {
  private constructor(private readonly value: string) {}

  static create(name: string): PokemonName {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Pokemon name cannot be empty');
    }
    return new PokemonName(trimmed);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PokemonName): boolean {
    return this.value === other.value;
  }
}
