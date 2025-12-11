export class AuthService {
    private static instance: AuthService;
    private isAuthenticated: boolean = false;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public login(username: string, password: string): boolean {
        if (username === 'admin' && password === 'admin1234.!') {
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }

    public logout(): void {
        this.isAuthenticated = false;
    }

    public isLoggedIn(): boolean {
        return this.isAuthenticated;
    }
}
