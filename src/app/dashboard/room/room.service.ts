import { HttpClient } from '@angular/common/http';
import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { SocketService } from '../../socketservice/socket.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular/standalone';
export interface ClientUser {
  _id?: string;
  username?: string;
  socketId?: string;
}
export interface Message {
  text: string;
  from: string;
  to: string;
  timestamp?: Date;
}
export interface UserConversationResponse {
  user: ClientUser,
  conversations: Message[]
}
export interface UserWithConversation {
  user: ClientUser[],
  messages: Message[],
  userId?: String[]
}


@Injectable({
  providedIn: 'root',
})
export class RoomService {
  public onDestoyComponents: boolean = false;
  private loading!: HTMLIonLoadingElement;
  constructor(
    private socket: Socket,
    private http: HttpClient,
    private storage: Storage,
    private socketservice: SocketService,
    private loadingController: LoadingController,
    private route: Router,) {
    storage.create();
  }
  onNewUser(search: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get(`${environment.URI}/user/newUserCheck`, { headers: headers, params: { search: search } })
  }

  getPendingMsg(callback: (userId: any) => void): void {
    const userId = localStorage.getItem('userId');
    this.socket.emit('user-online', userId);
    // this.socket.on('pending-messages', (pendingMessages: any[]) => {
    //   // Handle the pending messages received from the server
    //   console.log('Pending messages:', pendingMessages);
    // });
    this.socket.on('pending-messages', callback);
  }

  GetOfflineMsg() {
    this.getPendingMsg(async (user: UserWithConversation) => {
      console.log(user);
      if (user.messages != undefined) {
        for (const message of user.messages) {
          const cacheConversation = await this.getData(message.from);
          if (!cacheConversation) {
            console.log(message)
            await this.storeData(message.from, [message]);
          } else {
            cacheConversation.push(message)
            await this.storeData(message.from, cacheConversation);
          }
        }

        // // Check if userList is empty
        // if (this.userList.length === 0) {
        //     // If userList is empty, add all users to userList
        //     for (const res of user.user) {
        //         this.userList.push(res);
        //     }
        // } else {
        //     // If userList is not empty, add only new users to userList
        //     for (const res of user.user) {
        //         let exists = false;
        //         for (const r of this.userList) {
        //             if (r.username === res.username) {
        //                 exists = true;
        //                 break;
        //             }
        //         }
        //         if (!exists) {
        //             this.userList.push(res);
        //         }
        //     }
        // }
      }
    });
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

  async storeData(key: string, value: any): Promise<boolean> {
    try {
      await this.storage.set(key, value);
      console.log('Data stored successfully!');
      return true; // Return true indicating successful storing
    } catch (error) {
      console.error('Error storing data:', error);
      return false; // Return false indicating storing failed
    }
  }
  async getData(key: string) {
    const retrievedValue: any = await this.storage.get(key);
    return retrievedValue
  }
  async getAllUserDetails() {
    const users = await this.storage.keys();
    return users;
  }
  async addAllUsers(key: string, value: any) {
    try {
      await this.storage.set(key, value);
      console.log('Data stored successfully!');
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  async destroyeIndexDb() {
    await this.storage.clear();
  }
  loadConversation(): Promise<boolean> {
    return this.callConversation()
  }
  private async callConversation(): Promise<boolean> {
    const username = localStorage.getItem('username');
    if (!username) {
      return false;
    }
    const response = await this.socketservice.getConversationUser(username).toPromise();
    if (response) {
      for (const item of response) {
        const user = item.user;
        const conversations = item.conversations;
        if (user) {
          const storedUsers = await this.getAllUserDetails();
          const userExists = storedUsers.includes(user.username);

          if (!userExists) {
            this.addUserToList(user);
          }
        }
        if (user && conversations) {
          const storedSuccessfully = await this.storeData(username, conversations);
          if (!storedSuccessfully) {
            return false;
          }
        }
      }
      return true
    } else {
      return false
    }
  }

  private addUserToList(user: ClientUser) {
    // this.userList.push(user);
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Loading...'
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}