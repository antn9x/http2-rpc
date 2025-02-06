import { createClient } from "../src"
import type { TokenService } from "./server.spec"

const tokenService = createClient<TokenService>('http://localhost:3000')

console.log(tokenService.generateToken(12))