import type { HttpClient } from '../../domain/ports/http-port';

export class FetchHttpClient implements HttpClient {
  async get(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.text();
  }

  async getHtml(url: string): Promise<string> {
    return this.get(url);
  }
}
