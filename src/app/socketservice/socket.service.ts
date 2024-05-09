import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket, } from 'ngx-socket-io';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface User {
  userId: string;
  socketId: string;
}
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private uri = environment.URI;
  reload = true;
  customSocket!: Socket;
  constructor(private socket: Socket, private http: HttpClient) {
  }
  //  API calls
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

  GetOfflineMsgThrowApi() {
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userId');
    if (userID === null) { console.log(' UserId not found'); return }
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get(`${environment.URI}/offline/getMessages`, { headers: headers, params: { id: userID } })
      .pipe(
        catchError(error => {
          // Handle the error here (e.g., log it, display a message to the user)
          console.error('Error fetching offline messages:', error);
          return throwError(error); // Rethrow the error to propagate it to the subscriber
        })
      );
  }
  GetPendingMsgThrowApi() {
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userId');
    if (userID === null) {
      console.log('UserId not found');
      return;
    }
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get(`${environment.URI}/offline/pendingMessage`, { headers: headers, params: { id: userID } })
      .pipe(
        catchError(error => {
          // Handle the error here (e.g., log it, display a message to the user)
          console.error('Error fetching pending messages:', error);
          return throwError(error); // Rethrow the error to propagate it to the subscriber
        })
      );
  }

  addOfflineMsgThrowApi() {
    const token = localStorage.getItem('token');
    const listOfPendingMsg = localStorage.getItem('unsentMessages') || '[]';
    if (listOfPendingMsg.length === 2) {
      console.log('No offline pending messages');
      return;
    }
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    console.log(listOfPendingMsg);
    return this.http.get(`${environment.URI}/offline/messages`, { headers: headers, params: { messages: listOfPendingMsg } })
      .pipe(
        catchError(error => {
          // Handle the error here (e.g., log it, display a message to the user)
          console.error('Error adding offline messages:', error);
          return throwError(error); // Rethrow the error to propagate it to the subscriber
        })
      );
  }

  // Socket Calls
  connect() {
    const userId = localStorage.getItem('userId');
    if (userId != null) {
      this.socket.ioSocket.io.opts.query = { userId: userId };
      // console.log(this.socket.ioSocket.id)
      this.socket.connect();
      this.initCurrentUserListener();
    }
  }

  disconnect() {
    this.socket.disconnect();
  }


  checkingClientFromServer() {
    this.socket.on('from_server', (ackCallback: any) => {
      ackCallback(true);
    })
  }

  checkUpdates(callback: (data: any) => void) {
    this.socket.on('call_updates', (ackCallback: any) => {
      ackCallback(true);
      this.GetOfflineMsgThrowApi()?.subscribe((data: any) => {
        callback(data); // Invoke the callback function with the retrieved data
      });
    })
  }

  socketLogin(UserId: any) {
    this.connect();
    this.socket.emit('login', UserId);
    this.socket.emit('user-online', { UserId });
    this.initCurrentUserListener();
  }

  private initCurrentUserListener(): void {
    this.socket.fromEvent<any>('currentUser').subscribe((currentUser: User) => {
      localStorage.setItem('socketId', currentUser.socketId);
    });
  }


  afterGettingIntoOnline(offlineCallback: (data?: any) => void, pendingCallback: (pending: any, apiStatus?: boolean) => void): void {
    this.GetPendingMsgThrowApi()?.subscribe((data: any) => {
      if (data) pendingCallback(data);
    })
    setTimeout(() => {
      this.GetOfflineMsgThrowApi()?.subscribe((data: any) => {
        if (data) offlineCallback(data); // Invoke the callback function with the retrieved data
      });
    }, 3000);
  }

  calltrakingOfMsg(callback: (list: any) => void): void {
    this.socket.on('reciver_list', (reciverList: any) => {
      callback(reciverList);
    })
  }
  trackingConfirmationToFriend(friends: any) {
    const userId = localStorage.getItem('userId');
    console.log('im calling')
    if (userId != null) this.socket.emit('Im_got_msg_when_my_friend_offline', { friends, userId })
  }

  gettingInformationOffriendRecivedMsg(callback: (track: any) => void): void {
    this.socket.on('your_frined_got_msg_when_you_offline', (track: any) => {
      console.log(track)
      callback(track);
    })
  }



  async connectSocket() {
    const userid = localStorage.getItem('userId')
    this.socketLogin(userid);
  }

  sendMessage(uniqueId: any, senderId: string, receiverId: string, text: string): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
      const timeoutDuration = 1000;
      let isTimeout = false;
      const timeoutId = setTimeout(() => {
        isTimeout = true;
        resolve(false);
      }, timeoutDuration);

      this.socket.emit('sendMessage', { uniqueId, senderId, receiverId, text }, (success: boolean) => {
        clearTimeout(timeoutId);
        if (!isTimeout) {
          resolve(success);
        }
      });
    });
  }

  onGetMessage(callback: (message: any) => void): void {
    this.socket.on('getMessage', (responce: any) => {
      callback(responce)
    });
  }
  //  To confim  the msg is recived to the reciver
  receveidMsgConfirmation(callback: (message: any) => void): void {
    this.socket.on('messages-received', async (userId: any, ackCallback: any) => {
      const userid = localStorage.getItem('userId')
      ackCallback(true)
      if (userId !== userid) {
        callback(userId)
      }
    });
  }

  getConversation(from: string, to: string) {
    this.socket.emit('getConversation', { from, to });
    return this.socket.fromEvent<any[]>('conversation');
  }
}
