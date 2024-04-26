import { HttpClient } from '@angular/common/http';
import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface User {
  userId: string;
  socketId: string;
}
@Injectable({
  providedIn: 'root',
})
export class SocketService  {
  private uri = environment.URI;
  reload = true;
  constructor(private socket: Socket, private http: HttpClient) {
  }

  getConversationUser(username: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get(this.uri + '/user/getConversation', { headers: headers, params: { username: username } })
  }

  onSearch(search: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get(this.uri + '/user/findusers', { headers: headers, params: { search: search } })
  }
  connect() {
    const userId = localStorage.getItem('userId');

    if (userId != null) {
      this.socket.ioSocket.io.opts.query = { userId: userId };
      // console.log(this.socket.ioSocket.id)
      this.socket.connect();
      this.initCurrentUserListener();
    }
  }
  onConnect(callback: () => void): void {
    this.socket.on('connect', callback);
  }
  disconnect() {
    this.socket.disconnect();
  }

  initCurrentUserListener(): void {
    this.socket.fromEvent<any>('currentUser').subscribe((currentUser: User) => {
      localStorage.setItem('socketId', currentUser.socketId)
    });
  }

  socketLogin(UserId: any) {
    this.connect();
    this.socket.emit('login', UserId);
    this.initCurrentUserListener();
  }


  sendMessage(senderId: string, receverId: string, text: string) {
    this.socket.emit('sendMessage', { senderId, receverId, text });
  }

  getUserList() {
    return this.socket.fromEvent<User[]>('getUsers');
  }

  onGetCurrentUser(callback: (user: any) => void): void {
    this.socket.on('currentUser', callback);
  }

  onGetUsers(callback: (users: any) => void): void {
    this.socket.on('getUsers', callback);
  }

  onGetMessage(callback: (message: any) => void): void {
    this.socket.on('getMessage', callback);
  }

  getPending() {
    const userId = localStorage.getItem('userId');
    this.socket.emit('user-online', userId);
    this.socket.on('pending-messages', (pendingMessages: any[]) => {
      // Handle the pending messages received from the server
      console.log('Pending messages:', pendingMessages);
    });
  }

  getConversation(from: string, to: string) {
    this.socket.emit('getConversation', { from, to });
    return this.socket.fromEvent<any[]>('conversation');
  }
}
