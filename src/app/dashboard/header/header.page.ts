import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/authguards/AuthService';
import { RoomService } from '../room/room.service';
import { IonTabBar, IonLabel, IonButton, IonIcon, IonTitle, IonButtons, IonToolbar, IonHeader } from '@ionic/angular/standalone';


@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
  standalone: true,
  imports: [IonTabBar, IonToolbar, IonHeader, IonLabel, IonTitle, CommonModule, IonButtons, IonButton, IonIcon, FormsModule]
})
export class HeaderPage {
  @Output() logout: EventEmitter<any> = new EventEmitter<any>();

  constructor(private router: Router, private authService: AuthService, private roomService: RoomService) { 
  }
  async logOut() {
    localStorage.clear();
    
    const loading: HTMLIonLoadingElement = await this.authService.presentLoading();
    this.roomService.onDestoyComponents = true;
    await this.roomService.destroyeIndexDb();
    setTimeout(() => {
      this.authService.dismissLoading(loading)
      this.router.navigateByUrl('');
      this.roomService.disConnect();
      this.roomService.destroyeIndexDb();
      this.logout.emit();
    }, 1000);
  }
}
