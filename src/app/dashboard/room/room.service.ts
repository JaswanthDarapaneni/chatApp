import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Socket } from 'ngx-socket-io';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { SocketService } from '../../socketservice/socket.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular/standalone';
export interface ClientUser {
  _id?: string;
  username?: string;
  socketId?: string;
  latestText?: string;
  unreadCount: number;
  UnreceivedMessages?: Messages[];
  UnseenMessages?: Messages[];
  UnsentMessages?: Messages[];
}
interface Messages {
  uniqueId: string; // Assuming uniqueId is a string
  isSended?: boolean;
  isReceived?: boolean;
  isSeen?: boolean;
}
export interface Message {
  text: string;
  from: string;
  to: string;
  isSended?: boolean;
  isRecived?: boolean;
  isSeen?: boolean;
  timestamp?: Date;
}
export interface UserConversationResponse {
  user: ClientUser,
  conversations: Message[]
}

export interface ConversationData {
  sender: ClientUser;
  messages: Message[];
}

export interface UserWithConversation {
  receiverId?: String[],
  data: ConversationData[]
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  checkUpdates(arg0: (data: any) => void) {
    throw new Error('Method not implemented.');
  }
  public onDestoyComponents: boolean = false;
  private loading!: HTMLIonLoadingElement;
  userList: any[] = []
  constructor(
    private socket: Socket,
    private http: HttpClient,
    private storage: Storage,
    private socketservice: SocketService,
    private loadingController: LoadingController,
  ) {
    storage.create();
  }
  disConnect() {
    this.socket.disconnect();
  };

  // API
  onNewUser(search: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get(`${environment.URI}/user/newUserCheck`, { headers: headers, params: { search: search } })
  }

  // Sockets

  async informUsers(id: any, callback: (success: any) => void) {
    try {
      const ackResponse = await this.socket.timeout(10000).emitWithAck('inform_users_to_receive_msg', { id });
      callback(ackResponse)
      // callback(true, ackResponse); // Call the callback function with success status and response
    } catch (e) {
      console.log('im calling at informUser', e);
      callback([]); // Call the callback function with failure status
    }
  }

  onGetMessage(callback: (message: any) => void): void {
    this.socket.on('getMessage', (responce: any) => {
      callback(responce);
    });
  }

  // optinal login calls dontlook to much on it

  async storeData(key: string, value: any): Promise<boolean> {
    try {
      await this.storage.set(key, value);
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
  async getAllKeys(): Promise<ClientUser[]> {
    try {
      const keys = await this.storage.keys();
      const parsedKeys: ClientUser[] = keys.map(key => this.parseKeyToObject(key));
      return parsedKeys;
    } catch (error) {
      console.error('Error retrieving keys:', error);
      return [];
    }
  }


  // for converting into objects
  private parseKeyToObject(key: string): any {
    const user: any = {} as any;
    const pairs = key.split(',');
    pairs.forEach(pair => {
      const [prop, value] = pair.split(':');
      user[prop] = value;
    });
    return user;
  }
  async addAllUsers(key: any, value: any) {
    try {
      await this.storage.set(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  async destroyeIndexDb() {
    await this.storage.clear();
  }

  //  Normal rooms calls
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

  forSmallScreen(): boolean {
    return window.innerWidth < 768;
  }

  SetItemToLocalStorage(key: any, values: any) {
    localStorage.setItem(key, JSON.stringify(values));
  }
  // Auth calls when login
  loadConversation(): Promise<boolean> {
    console.log('im for conversation')
    return this.callConversation();
  }
  private async callConversation(): Promise<boolean> {
    const username = localStorage.getItem('username');
    if (!username) {
      return false;
    }
    const response = await this.socketservice.getConversationUser(username).toPromise();

    if (!response) {
      return false;
    }

    for (const item of response) {
      const user = item.user;
      const conversations = item.conversations;
      if (!user) {
        continue;
      }

      // Construct the key
      const key = `_id:${user._id},username:${user.username}`;

      // Check if user already exists
      const userExists = await this.userExists(key);
      if (!userExists) {
        this.addUserToList(user);
      }

      // Store conversations
      const storedSuccessfully = await this.storeData(key, conversations);
      if (!storedSuccessfully) {
        return false;
      }
    }
    return true;
  }

  private async userExists(key: string): Promise<boolean> {
    const storedKeys: string[] = await this.storage.get(key);
    if (storedKeys === null) return true;
    return true
  }

  private addUserToList(user: ClientUser) {
    this.userList.push(user);
  }
}