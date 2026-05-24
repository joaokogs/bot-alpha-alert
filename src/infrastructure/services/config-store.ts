import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export interface BotConfig {
  alphaChannelId?: string;
  phenoChannelId?: string;
  swarmChannelId?: string;
  alphaRoleId?: string;
  phenoRoleId?: string;
  swarmRoleId?: string;
}

export type EnvFallbacks = Pick<
  BotConfig,
  'alphaChannelId' | 'phenoChannelId' | 'swarmChannelId' | 'alphaRoleId' | 'phenoRoleId' | 'swarmRoleId'
>;

/** Multi-guild config store — salva configuração separada por servidor */
export class ConfigStore {
  private configs: Record<string, BotConfig> = {};
  private readonly filePath: string;
  private readonly envFallbacks: EnvFallbacks;

  constructor(filePath?: string, envFallbacks?: EnvFallbacks) {
    this.filePath = filePath ?? join(process.cwd(), 'data', 'config.json');
    this.envFallbacks = envFallbacks ?? {};
    this.load();
  }

  /* ---------- Persistência ---------- */

  private load(): void {
    try {
      if (!existsSync(this.filePath)) {
        this.configs = {};
        return;
      }
      const raw = readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      // Aceita tanto o formato antigo (objeto único) quanto o novo (guildId -> config)
      if (parsed && typeof parsed === 'object' && !parsed.alphaChannelId && !parsed.alphaRoleId) {
        this.configs = parsed as Record<string, BotConfig>;
      } else {
        // Migração: config única vira config do primeiro servidor
        // Na prática, sem guildId conhecido, guardamos sob uma chave "_legacy"
        this.configs = { _legacy: parsed as BotConfig };
      }
    } catch (err) {
      console.warn(`[ConfigStore] Failed to parse config file: ${err instanceof Error ? err.message : String(err)}`);
      this.configs = {};
    }
  }

  private save(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.filePath, JSON.stringify(this.configs, null, 2));
  }

  /* ---------- API pública ---------- */

  /** Retorna a config de uma guild, mesclada com fallbacks do .env */
  getGuildConfig(guildId: string): BotConfig {
    const guildConfig = this.configs[guildId] ?? {};
    return { ...this.envFallbacks, ...guildConfig };
  }

  /** Atualiza a config de uma guild */
  updateGuildConfig(guildId: string, partial: Partial<BotConfig>): void {
    const current = this.configs[guildId] ?? {};
    this.configs[guildId] = { ...current, ...partial };
    this.save();
  }

  /** Lista todos os guildIds que já possuem alguma configuração salva */
  getAllGuildIds(): string[] {
    return Object.keys(this.configs);
  }

  /** Retorna a config crua (sem fallback) de uma guild — útil internamente */
  getRaw(guildId: string): BotConfig | undefined {
    return this.configs[guildId];
  }

  // --- Getters por guild (com fallback) ---

  getAlphaChannelId(guildId: string): string | undefined {
    return this.getGuildConfig(guildId).alphaChannelId;
  }

  getPhenoChannelId(guildId: string): string | undefined {
    return this.getGuildConfig(guildId).phenoChannelId;
  }

  getSwarmChannelId(guildId: string): string | undefined {
    return this.getGuildConfig(guildId).swarmChannelId;
  }

  getAlphaRoleId(guildId: string): string | undefined {
    return this.getGuildConfig(guildId).alphaRoleId;
  }

  getPhenoRoleId(guildId: string): string | undefined {
    return this.getGuildConfig(guildId).phenoRoleId;
  }

  getSwarmRoleId(guildId: string): string | undefined {
    return this.getGuildConfig(guildId).swarmRoleId;
  }
}
