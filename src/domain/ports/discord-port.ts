import type { Alpha } from '../entities/alpha';
import type { Pheno } from '../entities/pheno';
import type { Swarm } from '../entities/swarm';

export interface DiscordNotifier {
  notifyAlpha(alpha: Alpha): Promise<void>;
  notifyPheno(pheno: Pheno): Promise<void>;
  notifySwarm(swarm: Swarm): Promise<void>;
  isReady(): boolean;
}
