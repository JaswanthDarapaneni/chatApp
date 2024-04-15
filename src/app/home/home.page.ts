import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { io } from 'socket.io-client';
import { SocketService, User } from '../socketservice/socket.service';
import { ChatPage } from '../chat/chat.page';
import { Router, RouterModule } from '@angular/router';
import { MenuController } from '@ionic/angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ChatPage],
  providers: []
})
export class HomePage implements AfterViewInit{
  messages: string[] = [];
  users: User[] = [];
  newMessage: string = '';
  socket: any;
  ToUser!: any;
  userSelected: any = '';

  constructor(
    private service: SocketService,
    // private navCtrl: NavController,
    private router: Router,
  ) {
    this.service.connect();
  }
  ngAfterViewInit(): void {
    const user= localStorage.getItem('username');
      this.service.getUserList()
  }
  
  navigateToChat(user: User) {
    const userId = user.userId 
    const socketId = user.socketId
    if (window.innerWidth < 768) {
      // this.navCtrl.navigateForward(['/chat', { userId, socketId }]);
    } else {
      this.userSelected = user;
    }

  }
}
