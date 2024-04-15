import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
export interface User {
  userId: string;
  socketId: string;
}
@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnChanges {

  constructor(private socket: Socket) { }
  ngOnChanges(changes: SimpleChanges): void {

  }

  connect() {
    this.socket.connect();
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
  login(username: string) {
    this.socket.emit('login', username);
    this.initCurrentUserListener()
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
  onGetUsers(callback: (users: any[]) => void): void {
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
