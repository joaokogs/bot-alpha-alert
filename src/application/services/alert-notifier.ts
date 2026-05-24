import type { Alpha } from '../../domain/entities/alpha';
import type { Pheno } from '../../domain/entities/pheno';
import type { Swarm } from '../../domain/entities/swarm';
import type { DiscordNotifier } from '../../domain/ports/discord-port';
import { DiscordNotReadyError } from '../errors/discord-error';

export class AlertNotifier {
  constructor(private readonly discordNotifier: DiscordNotifier) {}

  async notifyAlphas(alphas: Alpha[]): Promise<void> {
    if (!this.discordNotifier.isReady()) {
      throw new DiscordNotReadyError();
    }

    for (const alpha of alphas) {
      await this.discordNotifier.notifyAlpha(alpha);
    }
  }

  async notifyPhenos(phenos: Pheno[]): Promise<void> {
    if (!this.discordNotifier.isReady()) {
      throw new DiscordNotReadyError();
    }

    for (const pheno of phenos) {
      await this.discordNotifier.notifyPheno(pheno);
    }
  }

  async notifySwarms(swarms: Swarm[]): Promise<void> {
    if (!this.discordNotifier.isReady()) {
      throw new DiscordNotReadyError();
    }

    for (const swarm of swarms) {
      await this.discordNotifier.notifySwarm(swarm);
    }
  }
}
