import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";

// instantiate the single implementation instance of the repository layer
const authRepository = new AuthRepository();

// inject repository into your processing service engine instance
const authService = new AuthService(authRepository);

export { authService };

