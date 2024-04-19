import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/socketservice/socket.service';
import { AuthService } from 'src/app/authguards/AuthService';


@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HeaderPage implements OnInit {

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
  }
  async logOut() {
    localStorage.clear();
    const loading: HTMLIonLoadingElement = await this.authService.presentLoading();
    setTimeout(() => {
      this.authService.dismissLoading(loading)
      this.router.navigateByUrl('');
    }, 1000);

  }

}
