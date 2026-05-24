import { Elysia } from 'elysia';
import { z } from 'zod';
import type { DiscordNotifier } from '../../domain/ports/discord-port';
import { PokemonName } from '../../domain/value-objects/pokemon-name';
import { Timestamp } from '../../domain/value-objects/timestamp';
import { Alpha } from '../../domain/entities/alpha';
import { Swarm } from '../../domain/entities/swarm';

const webhookPayloadSchema = z.object({
  pokemon: z.string().min(1),
  location: z.string().optional(),
  region: z.string().optional(),
  id: z.number().optional(),
  topic: z.string().optional(),
  originalJson: z.object({
    data: z.object({
      Ability: z.string().optional(),
      Moveset: z.array(z.string()).optional(),
      Tier: z.number().optional(),
      Region: z.string().optional(),
      'Specific Location': z.string().optional(),
      'Location Notes': z.string().optional(),
      'Egg Group': z.array(z.string()).optional(),
      'Male Ratio': z.string().optional(),
      HMs: z.array(z.string()).optional(),
      Notes: z.array(z.string()).optional(),
    }).optional(),
    despawnTimestamp: z.number().optional(),
    shareUrl: z.string().optional(),
  }).optional(),
  published_by: z.string().optional(),
});

function logRequest(method: string, path: string, body: unknown): void {
  const raw = JSON.stringify(body, null, 2);
  console.log(`[Webhook] ➡️ ${method} ${path}`);
  console.log(`[Webhook] 📦 BODY COMPLETO:\n${raw}`);
}

function logResponse(method: string, path: string, status: number, body: unknown): void {
  console.log(`[Webhook] ⬅️ ${method} ${path} [${status}]`, JSON.stringify(body));
}

export function webhookRoutes(app: Elysia, notifier?: DiscordNotifier): void {
  // Log de requisições
  app.on('request', (ctx) => {
    console.log(`[HTTP] ${ctx.request.method} ${ctx.request.url}`);
  });

  // ⚠️ O site manda TUDO (alpha e swarm) para /webhook/alpha
  // O campo "topic" define o tipo: "alphapings" | "swarmpings"
  app.post('/webhook/alpha', async ({ body, set }) => {
    logRequest('POST', '/webhook/alpha', body);

    try {
      const result = webhookPayloadSchema.safeParse(body);
      if (!result.success) {
        set.status = 400;
        const response = { error: 'Invalid payload', details: result.error.flatten() };
        logResponse('POST', '/webhook/alpha', 400, response);
        return response;
      }

      const p = result.data;
      const data = p.originalJson?.data;
      const topic = p.topic ?? 'alphapings';
      const isAlpha = topic.includes('alpha');
      const type = isAlpha ? 'alpha' : 'swarm';

      console.log(`[Webhook] ✅ ${type} alert received: ${p.pokemon} (${p.location})`);

      // Enviar notificação pro Discord
      if (notifier?.isReady()) {
        const pokemonName = PokemonName.create(p.pokemon);

        if (isAlpha) {
          const entity = new Alpha(
            `webhook:alpha:${p.id ?? Date.now()}`,
            pokemonName,
            Timestamp.now(),
            {},
            data?.Tier ?? 0,
            p.location ?? 'Unknown',
            data?.Moveset ?? [],
            {
              Ability: data?.Ability ?? '',
              Region: p.region ?? data?.Region ?? '',
              'Location Notes': data?.['Location Notes'] ?? '',
              'Male Ratio': data?.['Male Ratio'] ?? '',
              'Egg Group': (data?.['Egg Group'] ?? []).join(', '),
              HMs: (data?.HMs ?? []).join(', '),
              despawnTimestamp: String(p.originalJson?.despawnTimestamp ?? ''),
              shareUrl: p.originalJson?.shareUrl ?? '',
              publishedBy: p.published_by ?? '',
            },
          );
          await notifier.notifyAlpha(entity);
        } else {
          const entity = new Swarm(
            `webhook:swarm:${p.id ?? Date.now()}`,
            pokemonName,
            Timestamp.now(),
            {},
            p.location ?? 'Unknown',
            {
              Region: p.region ?? data?.Region ?? '',
              'Location Notes': data?.['Location Notes'] ?? '',
              HMs: (data?.HMs ?? []).join(', '),
              despawnTimestamp: String(p.originalJson?.despawnTimestamp ?? ''),
              shareUrl: p.originalJson?.shareUrl ?? '',
              Notes: (data?.Notes ?? []).join(', '),
              publishedBy: p.published_by ?? '',
            },
          );
          await notifier.notifySwarm(entity);
        }

        console.log(`[Webhook] 📨 ${type} notification sent to Discord`);
      } else {
        console.log(`[Webhook] ⚠️ Discord notifier not ready, skipping notification`);
      }

      const response = {
        received: true,
        type,
        pokemon: p.pokemon,
        location: p.location,
        region: p.region,
        topic,
      };
      logResponse('POST', '/webhook/alpha', 200, response);
      return response;
    } catch (err) {
      set.status = 500;
      const response = { error: 'Internal server error', message: err instanceof Error ? err.message : String(err) };
      logResponse('POST', '/webhook/alpha', 500, response);
      return response;
    }
  });

  // Pheno desabilitado (site não envia mais)
  app.post('/webhook/pheno', ({ set }) => {
    set.status = 410;
    return { error: 'Pheno alerts are disabled', type: 'pheno' };
  });

  // Swarm endpoint separado (não usado pelo site, mas disponível)
  app.post('/webhook/swarm', async ({ body, set }) => {
    logRequest('POST', '/webhook/swarm', body);

    try {
      const result = webhookPayloadSchema.safeParse(body);
      if (!result.success) {
        set.status = 400;
        const response = { error: 'Invalid payload', details: result.error.flatten() };
        logResponse('POST', '/webhook/swarm', 400, response);
        return response;
      }

      const p = result.data;
      const data = p.originalJson?.data;
      console.log(`[Webhook] ✅ Swarm alert received: ${p.pokemon} (${p.location})`);

      if (notifier?.isReady()) {
        const pokemonName = PokemonName.create(p.pokemon);
        const swarm = new Swarm(
          `webhook:swarm:${p.id ?? Date.now()}`,
          pokemonName,
          Timestamp.now(),
          {},
          p.location ?? 'Unknown',
          {
            Region: p.region ?? data?.Region ?? '',
            'Location Notes': data?.['Location Notes'] ?? '',
            HMs: (data?.HMs ?? []).join(', '),
            despawnTimestamp: String(p.originalJson?.despawnTimestamp ?? ''),
            shareUrl: p.originalJson?.shareUrl ?? '',
            Notes: (data?.Notes ?? []).join(', '),
            publishedBy: p.published_by ?? '',
          },
        );
        await notifier.notifySwarm(swarm);
        console.log(`[Webhook] 📨 Swarm notification sent to Discord`);
      } else {
        console.log(`[Webhook] ⚠️ Discord notifier not ready, skipping notification`);
      }

      return { received: true, type: 'swarm', pokemon: p.pokemon, location: p.location };
    } catch (err) {
      set.status = 500;
      return { error: 'Internal server error', message: err instanceof Error ? err.message : String(err) };
    }
  });

  // Rota de debug — mostra o body completo sem validação
  app.post('/webhook/debug', ({ body, set }) => {
    console.log('[Webhook] 🐛 DEBUG - Body recebido:');
    console.log(JSON.stringify(body, null, 2));
    return { received: true, body };
  });

  app.get('/webhook/debug', ({ set }) => {
    set.status = 405;
    return { error: 'Use POST para enviar o payload' };
  });

  console.log('[Webhook] Routes: /webhook/alpha, /webhook/swarm, /webhook/debug (+ /webhook/pheno desabilitado)');
}
