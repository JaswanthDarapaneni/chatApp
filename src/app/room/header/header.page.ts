import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/socketservice/socket.service';
import { AuthService } from 'src/app/authguards/AuthService';
import { RoomService } from '../room.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HeaderPage {

  constructor(private router: Router, private authService: AuthService, private roomService: RoomService) { }
  async logOut() {
    localStorage.clear();
    const loading: HTMLIonLoadingElement = await this.authService.presentLoading();
    this.roomService.onDestoyComponents = true;
    setTimeout(() => {
      this.authService.dismissLoading(loading)
      this.router.navigateByUrl('');
      this.roomService.disConnect();
    }, 1000);
  }
}
