# http2-rpc

To install dependencies:

```bash
bun add http2-rpc
```

To run:

```ts
import { register, createClient } from "http2-rpc";

interface TokenService {
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

// client
const tokenService = createClient<TokenService>('http://localhost:3000')

console.log(tokenService.generateToken(12))

```
