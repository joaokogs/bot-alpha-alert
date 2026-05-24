import { z } from 'zod';

const envSchema = z.object({
  // Obrigatórios
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),

  // Guilds autorizadas — lista de IDs separada por vírgula
  // Se vazio, o bot NÃO ACEITA nenhum servidor (você deve configurar depois)
  DISCORD_ALLOWED_GUILDS: z.string().default(''),

  // Fallbacks opcionais — usados quando a guild não configurou via slash command
  DISCORD_ALPHA_CHANNEL_ID: z.string().optional(),
  DISCORD_PHENO_CHANNEL_ID: z.string().optional(),
  DISCORD_SWARM_CHANNEL_ID: z.string().optional(),
  DISCORD_ALPHA_ROLE_ID: z.string().optional(),
  DISCORD_PHENO_ROLE_ID: z.string().optional(),
  DISCORD_SWARM_ROLE_ID: z.string().optional(),

  // Opcional — só usar em dev para comandos instantâneos
  DISCORD_GUILD_ID: z.string().optional(),

  // Scraping
  ALPHA_SITE_URL: z.string().default('https://alpha.pokemmotools.org/'),
  SCRAPE_INTERVAL_MS: z.string().default('30000'),

  // Servidor HTTP
  SERVER_PORT: z.string().default('3000'),

  // Cache
  CACHE_TTL_MS: z.string().default('300000'),

  // Logs
  LOG_LEVEL: z.string().default('info'),
});

export interface Env {
  DISCORD_TOKEN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_ALLOWED_GUILDS: string[];
  DISCORD_ALPHA_CHANNEL_ID?: string;
  DISCORD_PHENO_CHANNEL_ID?: string;
  DISCORD_SWARM_CHANNEL_ID?: string;
  DISCORD_ALPHA_ROLE_ID?: string;
  DISCORD_PHENO_ROLE_ID?: string;
  DISCORD_SWARM_ROLE_ID?: string;
  DISCORD_GUILD_ID?: string;
  ALPHA_SITE_URL: string;
  SCRAPE_INTERVAL_MS: number;
  SERVER_PORT: number;
  CACHE_TTL_MS: number;
  LOG_LEVEL: string;
}

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.error(`[Config] Invalid environment variables:\n${issues}`);
    process.exit(1);
  }

  const raw = result.data;

  return {
    DISCORD_TOKEN: raw.DISCORD_TOKEN,
    DISCORD_CLIENT_ID: raw.DISCORD_CLIENT_ID,
    DISCORD_ALLOWED_GUILDS: raw.DISCORD_ALLOWED_GUILDS
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    DISCORD_ALPHA_CHANNEL_ID: raw.DISCORD_ALPHA_CHANNEL_ID,
    DISCORD_PHENO_CHANNEL_ID: raw.DISCORD_PHENO_CHANNEL_ID,
    DISCORD_SWARM_CHANNEL_ID: raw.DISCORD_SWARM_CHANNEL_ID,
    DISCORD_ALPHA_ROLE_ID: raw.DISCORD_ALPHA_ROLE_ID,
    DISCORD_PHENO_ROLE_ID: raw.DISCORD_PHENO_ROLE_ID,
    DISCORD_SWARM_ROLE_ID: raw.DISCORD_SWARM_ROLE_ID,
    DISCORD_GUILD_ID: raw.DISCORD_GUILD_ID,
    ALPHA_SITE_URL: raw.ALPHA_SITE_URL,
    SCRAPE_INTERVAL_MS: parseInt(raw.SCRAPE_INTERVAL_MS, 10),
    SERVER_PORT: parseInt(raw.SERVER_PORT, 10),
    CACHE_TTL_MS: parseInt(raw.CACHE_TTL_MS, 10),
    LOG_LEVEL: raw.LOG_LEVEL,
  };
}
