import { Elysia } from 'elysia';
import { node } from '@elysia/node';
import type { StatusService } from '../../application/services/status-service';
import type { DiscordNotifier } from '../../domain/ports/discord-port';
import { webhookRoutes } from '../services/webhook';

export function createElysiaApp(
  statusService: StatusService,
  notifier?: DiscordNotifier,
): Elysia {
  const app = new Elysia({ adapter: node() });

  app.get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  app.get('/status', () => statusService.getStatus());

  webhookRoutes(app, notifier);

  return app;
}
