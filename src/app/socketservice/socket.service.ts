import { HttpClient } from '@angular/common/http';
import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface User {
  userId: string;
  socketId: string;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnChanges {
  private uri = environment.URI;

  constructor(private socket: Socket, private http: HttpClient) { }
  ngOnChanges(changes: SimpleChanges,): void {

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
    this.socket.ioSocket.io.opts.query = { userId: userId };
    console.log(this.socket.ioSocket.id)
    this.initCurrentUserListener();
    this.socket.connect();
  }
  onConnect(callback: () => void): void {
    this.socket.on('connect', callback);
  }
  receiveMessage() { }

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

  listenForNewMessages() {
    return this.socket.fromEvent<string>('newMessage');
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

  onConversation(callback: (conversation: any[]) => void): void {
    this.socket.on('conversation', callback);
    this.socket.listeners('conversation');
  }

  getConversation(from: string, to: string) {
    this.socket.emit('getConversation', { from, to });
    return this.socket.fromEvent<any[]>('conversation');
  }
}
