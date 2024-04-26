import { HttpClient } from '@angular/common/http';
import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
export interface ClientUser {
    _id: string;
    username: string;
    socketId: string;
}
@Injectable()
export class ChatBoxService {
    public onDestoyComponents: boolean = false;
    constructor(
        private socket: Socket,
        private http: HttpClient,
        private storage: Storage) {
        this.storage.create();
        console.log('im calling')
    }

    onNewUser(search: any): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        return this.http.get(`${environment.URI}/user/newUserCheck`, { headers: headers, params: { search: search } })
    }

    getPendingMsg(callback: (userId: any) => void): void {
        console.log('im calling')
        const userId = localStorage.getItem('userId');
        this.socket.emit('user-online', userId);
        // this.socket.on('pending-messages', (pendingMessages: any[]) => {
        //   // Handle the pending messages received from the server
        //   console.log('Pending messages:', pendingMessages);
        // });
        this.socket.on('pending-messages', callback);
    }

    forSmallScreen(): boolean {
        return window.innerWidth < 768;
    }

    disConnect() {
        this.socket.disconnect();
    }

    SetItemToLocalStorage(key: any, values: any) {
        localStorage.setItem(key, JSON.stringify(values));
    }


     async storeData(key: string, value: any) {
        try {
            // Call set() method of Storage service to store data
            await this.storage.set(key, value);
            console.log('Data stored successfully!');

        } catch (error) {
            console.error('Error storing data:', error);
        }
    }
    async getData(key: string) {
        const retrievedValue: any = await this.storage.get(key);
        return retrievedValue
    }
    

}