import { register } from "../src";

export interface TokenService {
  generateToken(userId: number): Promise<string>;
  verifyToken(token: string): Promise<number>;
}

register<TokenService>({
  async generateToken(userId: number) {
    return `Hello, ${userId}!`;
  },
  async verifyToken(token) {
    return 1;
  },
})