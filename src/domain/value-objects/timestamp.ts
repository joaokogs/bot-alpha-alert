export class Timestamp {
  private constructor(private readonly date: Date) {}

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  static from(date: Date): Timestamp {
    return new Timestamp(date);
  }

  static fromISO(iso: string): Timestamp {
    return new Timestamp(new Date(iso));
  }

  toDate(): Date {
    return this.date;
  }

  toISOString(): string {
    return this.date.toISOString();
  }

  isExpired(ttlMs: number): boolean {
    return Date.now() - this.date.getTime() > ttlMs;
  }

  equals(other: Timestamp): boolean {
    return this.date.getTime() === other.date.getTime();
  }
}
