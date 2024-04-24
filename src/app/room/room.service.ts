import { HttpClient } from '@angular/common/http';
import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
export interface ClientUser {
  _id: string;
  username: string;
  socketId: string;
}
@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public onDestoyComponents: boolean = false;
  constructor(private socket: Socket, private http: HttpClient) {}
 

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
   
  disConnect(){
    this.socket.disconnect();
  }

  SetItemToLocalStorage(key: any, values: any) {
    localStorage.setItem(key, JSON.stringify(values));
  }

}