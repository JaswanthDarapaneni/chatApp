import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
})
export class SocketConfigService {
    private socketIoConfig: SocketIoConfig = {
        url: 'http://localhost:3001',
        options: {
            autoConnect: false,
            reconnectionAttempts: 0,
            reconnection: false,
            closeOnBeforeunload: false,
            rememberUpgrade: true,
            path: '/pendingMsgSocket'
        }
    };

    setConfig(config: SocketIoConfig): void {
        this.socketIoConfig = config;
    }

    getConfig(): SocketIoConfig {
        return this.socketIoConfig;
    }

    createSocket(): Socket {
        const config = this.getConfig();
        return new Socket(config);
    }
}
