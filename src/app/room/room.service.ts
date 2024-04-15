import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
})
export class RoomService {

    constructor(private socket: Socket) {

    }


    sendMessage(senderId: string, receverId: string, text: string) {
        this.socket.emit('sendMessage', { senderId, receverId, text });
    }

    getConversation(from: string, to: string) {
        this.socket.emit('getConversation', { from, to });
        return this.socket.fromEvent<any[]>('conversation');
    }
    onGetMessage(callback: (message: any) => void): void {
        this.socket.on('getMessage', callback);
    }

    onConversation(callback: (conversation: any[]) => void): void {
        this.socket.on('conversation', callback);
        this.socket.listeners('conversation');
    }

}