import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineOfflineService {
  private onlineStatus: Subject<boolean> = new Subject<boolean>();

  constructor() {
    
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  private updateOnlineStatus() {
    this.onlineStatus.next(navigator.onLine);
  }

  getOnlineStatus(): Observable<boolean> {
    return this.onlineStatus.asObservable();
  }
}
