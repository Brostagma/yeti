import { ReactNode } from 'react';

export interface AppDefinition {
    id: string;
    name: string;
    icon: string;
    description: string;
    component?: ReactNode; // For future use when we load components dynamically
    route?: string;
}

export class AppRegistry {
    private static instance: AppRegistry;
    private apps: Map<string, AppDefinition> = new Map();

    private constructor() {
        // Initialize with default system apps if any
        this.registerApp({
            id: 'settings',
            name: 'Settings',
            icon: '⚙️',
            description: 'System configuration'
        });
    }

    public static getInstance(): AppRegistry {
        if (!AppRegistry.instance) {
            AppRegistry.instance = new AppRegistry();
        }
        return AppRegistry.instance;
    }

    public registerApp(app: AppDefinition): void {
        if (this.apps.has(app.id)) {
            console.warn(`App with id ${app.id} is already registered.`);
            return;
        }
        this.apps.set(app.id, app);
    }

    public getApps(): AppDefinition[] {
        return Array.from(this.apps.values());
    }

    public getApp(id: string): AppDefinition | undefined {
        return this.apps.get(id);
    }
}
