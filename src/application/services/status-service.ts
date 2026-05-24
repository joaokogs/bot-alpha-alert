import type { CacheRepository } from '../../domain/ports/cache-port';
import type { DiscordNotifier } from '../../domain/ports/discord-port';

export interface BotStatus {
  discordReady: boolean;
  cacheSize: number;
  uptime: number;
  lastCheck: string | null;
}

export class StatusService {
  private readonly startTime: number;
  private lastCheckTime: string | null = null;

  constructor(
    private readonly cache: CacheRepository,
    private readonly discordNotifier: DiscordNotifier,
  ) {
    this.startTime = Date.now();
  }

  recordCheck(): void {
    this.lastCheckTime = new Date().toISOString();
  }

  getStatus(): BotStatus {
    return {
      discordReady: this.discordNotifier.isReady(),
      cacheSize: this.cache.size(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      lastCheck: this.lastCheckTime,
    };
  }
}
