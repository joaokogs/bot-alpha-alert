import * as cheerio from 'cheerio';
import type { Alpha } from '../../domain/entities/alpha';
import type { Pheno } from '../../domain/entities/pheno';
import type { Swarm } from '../../domain/entities/swarm';
import { AlphaParser } from './alpha-parser';
import { PhenoParser } from './pheno-parser';
import { SwarmParser } from './swarm-parser';

export class CheerioParser {
  private readonly alphaParser = new AlphaParser();
  private readonly phenoParser = new PhenoParser();
  private readonly swarmParser = new SwarmParser();

  parseAll(html: string): { alphas: Alpha[]; phenos: Pheno[]; swarms: Swarm[] } {
    const $ = cheerio.load(html);
    return {
      alphas: this.alphaParser.parse($),
      phenos: this.phenoParser.parse($),
      swarms: this.swarmParser.parse($),
    };
  }

  parseAlphaAlerts(html: string): Alpha[] {
    return this.parseAll(html).alphas;
  }

  parsePhenoAlerts(html: string): Pheno[] {
    return this.parseAll(html).phenos;
  }
}
