export class DiscordError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DiscordError';
  }
}

export class DiscordNotReadyError extends DiscordError {
  constructor() {
    super('Discord client is not ready');
    this.name = 'DiscordNotReadyError';
  }
}

export class DiscordSendError extends DiscordError {
  constructor(channelId: string, cause?: Error) {
    super(`Failed to send message to channel ${channelId}`, cause);
    this.name = 'DiscordSendError';
  }
}
