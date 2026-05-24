import type { Alpha } from '../../domain/entities/alpha';
import type { Pheno } from '../../domain/entities/pheno';
import type { Swarm } from '../../domain/entities/swarm';
import type { CacheRepository } from '../../domain/ports/cache-port';
import type { AlertSource, AlertCheckResult } from './alert-checker-types';
import { ScrapingError } from '../errors/alert-error';

export class AlertChecker {
  constructor(
    private readonly cache: CacheRepository,
    private readonly source: AlertSource,
    private readonly cacheTtlMs: number,
  ) {}

  async check(): Promise<AlertCheckResult> {
    const result: AlertCheckResult = { newAlphas: [], newPhenos: [], newSwarms: [], errors: [] };

    try {
      const { alphas, phenos, swarms } = await this.source.scrape();

      for (const alpha of alphas) {
        if (!this.cache.has(alpha.id)) {
          this.cache.set(alpha.id, alpha, this.cacheTtlMs);
          result.newAlphas.push(alpha);
        }
      }

      for (const pheno of phenos) {
        if (!this.cache.has(pheno.id)) {
          this.cache.set(pheno.id, pheno, this.cacheTtlMs);
          result.newPhenos.push(pheno);
        }
      }

      for (const swarm of swarms) {
        if (!this.cache.has(swarm.id)) {
          this.cache.set(swarm.id, swarm, this.cacheTtlMs);
          result.newSwarms.push(swarm);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      result.errors.push(new ScrapingError('Alert check failed', err));
    }

    return result;
  }
}
