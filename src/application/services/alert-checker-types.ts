import type { Alpha } from '../../domain/entities/alpha';
import type { Pheno } from '../../domain/entities/pheno';
import type { Swarm } from '../../domain/entities/swarm';

export interface AlertSource {
  scrape(): Promise<{ alphas: Alpha[]; phenos: Pheno[]; swarms: Swarm[] }>;
}

export interface AlertCheckResult {
  newAlphas: Alpha[];
  newPhenos: Pheno[];
  newSwarms: Swarm[];
  errors: Error[];
}
