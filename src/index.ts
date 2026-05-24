import { createDiscordClient } from './infrastructure/discord/client';
import { DiscordBotNotifier } from './infrastructure/discord/notifier';
import { FetchHttpClient } from './infrastructure/http/client';
import { InMemoryCache } from './infrastructure/services/cache';
import { ConfigStore } from './infrastructure/services/config-store';
import { CheerioParser } from './infrastructure/alerts/parser';
import { SiteScraper } from './infrastructure/alerts/scraper';
import { AlertChecker } from './application/services/alert-checker';
import { AlertNotifier } from './application/services/alert-notifier';
import { StatusService } from './application/services/status-service';
import { createElysiaApp } from './infrastructure/http/elysia-app';
import { registerCommands } from './infrastructure/discord/commands';
import { loadEnv } from './config/env';

const env = loadEnv();

const cache = new InMemoryCache();
const httpClient = new FetchHttpClient();
const parser = new CheerioParser();
const scraper = new SiteScraper(httpClient, parser, env.ALPHA_SITE_URL);

// Fallbacks do .env para ConfigStore
const configStore = new ConfigStore(undefined, {
  alphaChannelId: env.DISCORD_ALPHA_CHANNEL_ID,
  phenoChannelId: env.DISCORD_PHENO_CHANNEL_ID,
  swarmChannelId: env.DISCORD_SWARM_CHANNEL_ID,
  alphaRoleId: env.DISCORD_ALPHA_ROLE_ID,
  phenoRoleId: env.DISCORD_PHENO_ROLE_ID,
  swarmRoleId: env.DISCORD_SWARM_ROLE_ID,
});

async function main(): Promise<void> {
  // Registra comandos globalmente (ou em guild específica se configurado)
  await registerCommands({
    token: env.DISCORD_TOKEN,
    clientId: env.DISCORD_CLIENT_ID,
    guildId: env.DISCORD_GUILD_ID,
  });

  const discordClient = await createDiscordClient({
    token: env.DISCORD_TOKEN,
    configStore,
    allowedGuilds: env.DISCORD_ALLOWED_GUILDS,
  });

  // Notifier sem fallbacks fixos — busca a config de cada guild pelo ConfigStore
  const notifier = new DiscordBotNotifier(discordClient, configStore);

  const alertChecker = new AlertChecker(cache, scraper, env.CACHE_TTL_MS);
  const alertNotifier = new AlertNotifier(notifier);
  const statusService = new StatusService(cache, notifier);

  const app = createElysiaApp(statusService, notifier, discordClient, configStore);

  app.listen(env.SERVER_PORT, () => {
    console.log(`[Server] Elysia running on port ${env.SERVER_PORT}`);
  });

  let isRunning = true;
  let schedulerTimer: ReturnType<typeof setInterval> | null = null;

  async function runCheck(): Promise<void> {
    if (!isRunning) return;

    try {
      console.log('[Scheduler] Running alert check...');
      const result = await alertChecker.check();

      if (result.newAlphas.length > 0) {
        console.log(`[Scheduler] Found ${result.newAlphas.length} new Alpha(s)`);
        await alertNotifier.notifyAlphas(result.newAlphas);
      }

      if (result.newPhenos.length > 0) {
        console.log(`[Scheduler] Found ${result.newPhenos.length} new Pheno(s)`);
        await alertNotifier.notifyPhenos(result.newPhenos);
      }

      if (result.newSwarms.length > 0) {
        console.log(`[Scheduler] Found ${result.newSwarms.length} new Swarm(s)`);
        await alertNotifier.notifySwarms(result.newSwarms);
      }

      if (result.errors.length > 0) {
        for (const err of result.errors) {
          console.error('[Scheduler] Error:', err.message);
        }
      }

      statusService.recordCheck();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[Scheduler] Unexpected error:', message);
    }
  }

  console.log('[Bot] Discord client ready, starting scheduler...');
  setTimeout(() => runCheck(), 5000);
  schedulerTimer = setInterval(() => runCheck(), env.SCRAPE_INTERVAL_MS);

  function shutdown(): void {
    console.log('[Shutdown] Shutting down...');
    isRunning = false;
    if (schedulerTimer) clearInterval(schedulerTimer);
    cache.destroy();
    discordClient.destroy();
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('[Fatal] Failed to start bot:', error);
  process.exit(1);
});
