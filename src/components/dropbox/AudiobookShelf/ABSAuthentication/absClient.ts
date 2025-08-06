// services/AudiobookshelfClient.ts
import { AudiobookshelfAuth } from "./absAuthClass";
import { AudiobookshelfAPI } from "./absAPInew";
import { AuthCredentials, LoginResponse, LogoutResponse } from "./abstypes";

export class AudiobookshelfClient {
  public readonly auth: AudiobookshelfAuth;
  public readonly api: AudiobookshelfAPI;

  constructor(serverUrl: string) {
    this.auth = new AudiobookshelfAuth(serverUrl);
    this.api = new AudiobookshelfAPI(serverUrl, this.auth);
  }

  // Convenience methods that delegate to auth
  async login(credentials: AuthCredentials): Promise<LoginResponse> {
    return this.auth.login(credentials);
  }

  async logout(): Promise<LogoutResponse | null> {
    return this.auth.logout();
  }

  async isAuthenticated(): Promise<boolean> {
    return this.auth.isAuthenticated();
  }
}
