import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from 'src/app/socketservice/socket.service';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class UsersPage implements OnInit, OnChanges {
  @Input() Users: User[] =[];
  @Output() userSelected: EventEmitter<any> = new EventEmitter<any>();
  userList!:User[];

  constructor(private navCtrl: NavController) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Users'] && changes['Users'].currentValue) {
      this.userList = [...this.Users]; 
      console.log(this.userList)
    }
  }

  navigateToChat(user: User) {
    const userId = user.userId 
    const socketId = user.socketId
    if (window.innerWidth < 768) {
      this.navCtrl.navigateForward(['room/chatbox', { userId, socketId }]);
    } else {
      this.userSelected.emit(user);
    }
  }
 
  ngOnInit() {
  }

}
