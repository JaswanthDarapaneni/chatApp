import { HttpClient } from '@angular/common/http';
import { Injectable, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
export interface ClientUser {
    _id: string;
    username: string;
    socketId: string;
}
@Injectable()
export class ChatBoxService {
    public onDestoyComponents: boolean = false;
  private loading!: HTMLIonLoadingElement;

    constructor(
        private socket: Socket,
        private http: HttpClient,
        private storage: Storage,
        private loadingController: LoadingController,
        private toastController: ToastController
    ) {
        this.storage.create();
    }
    // checking one new user API 
    onNewUser(search: any): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        return this.http.get(`${environment.URI}/user/newUserCheck`, { headers: headers, params: { search: search } })
    }
    forSmallScreen(): boolean {
        return window.innerWidth < 768;
    }

    SetItemToLocalStorage(key: any, values: any) {
        localStorage.setItem(key, JSON.stringify(values));
    }
    
    async storeData(key: string, value: any) {
        try {
            // Call set() method of Storage service to store data
            await this.storage.set(key, value);

        } catch (error) {
            console.error('Error storing data:', error);
        }
    }

    async getData(key: any) {
        const retrievedValue = await this.storage.get(key);
        return retrievedValue
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

      async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 3000,
            position: 'top',
            cssClass: 'custom-toast'
        });
        toast.present();
    }
}