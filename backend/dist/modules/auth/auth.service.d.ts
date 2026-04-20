import type { LoginInput, RegisterFarmerInput, RegisterGovernmentInput, AuthUser, AuthResponse } from "./auth.schema";
export declare const authService: {
    registerFarmer(data: RegisterFarmerInput): Promise<AuthResponse>;
    registerGovernment(data: RegisterGovernmentInput): Promise<AuthResponse>;
    login(data: LoginInput): Promise<AuthResponse>;
    getMe(userId: string): Promise<AuthUser>;
};
