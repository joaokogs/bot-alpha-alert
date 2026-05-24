import type { Alpha } from '../../domain/entities/alpha';
import type { Pheno } from '../../domain/entities/pheno';
import type { Swarm } from '../../domain/entities/swarm';
import type { HttpClient } from '../../domain/ports/http-port';
import type { AlertSource } from '../../application/services/alert-checker-types';
import type { CheerioParser } from './parser';
import { ScrapingError } from '../../application/errors/alert-error';

export class SiteScraper implements AlertSource {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly parser: CheerioParser,
    private readonly siteUrl: string,
  ) {}

  async scrape(): Promise<{ alphas: Alpha[]; phenos: Pheno[]; swarms: Swarm[] }> {
    try {
      const html = await this.httpClient.getHtml(this.siteUrl);
      const { alphas, phenos, swarms } = this.parser.parseAll(html);
      return { alphas, phenos, swarms };
    } catch (error) {
      if (error instanceof ScrapingError) throw error;
      const err = error instanceof Error ? error : new Error(String(error));
      throw new ScrapingError(`Failed to scrape ${this.siteUrl}`, err);
    }
  }
}
