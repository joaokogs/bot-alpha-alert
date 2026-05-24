export interface HttpClient {
  get(url: string): Promise<string>;
  getHtml(url: string): Promise<string>;
}
