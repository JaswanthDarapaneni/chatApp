import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { SearchbarPage } from '../searchbar/searchbar.page';
import { ClientUser, RoomService } from '../room.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SearchbarPage]
})
export class UsersPage implements OnDestroy, OnChanges {
  @Input() Users: ClientUser[] = [];
  @Output() userSelected: EventEmitter<any> = new EventEmitter<any>();
  userList: ClientUser[] = [];

  constructor(private navCtrl: NavController, private roomService: RoomService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Users'] && changes['Users'].currentValue) {
      this.userList = this.Users
    }
  }
  handleUserSelected(user: ClientUser) {
    this.navigateToChat(user);
    this.Users.push(user);
  }

  navigateToChat(user: ClientUser) {
    if (window.innerWidth < 768) {
      this.SetItemToLocalStorage('selectedUser', { username: user.username, socketId: user.socketId, _id: user._id })
      this.navCtrl.navigateForward(['/chatbox']);
    } else {
      this.userSelected.emit(user);
    }
  }


  private SetItemToLocalStorage(key: any, values: any) {
    localStorage.setItem(key, JSON.stringify(values));
  }

  ngOnDestroy(): void {
    if (this.roomService.onDestoyComponents) {
      this.userList = [];
      this.Users = [];
    }
  }

}
