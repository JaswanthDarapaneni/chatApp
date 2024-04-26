import { AfterViewChecked, Component, EnvironmentInjector, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonItem, IonLabel, IonList, NavController } from '@ionic/angular/standalone';
import { SearchbarPage } from '../searchbar/searchbar.page';
import { ClientUser, RoomService } from '../room/room.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonList, IonLabel, IonItem, IonAvatar, CommonModule, FormsModule, SearchbarPage]
})
export class UsersPage implements OnDestroy, OnChanges, AfterViewChecked {
  public environmentInjector = inject(EnvironmentInjector);
  @Input() Users: ClientUser[] = [];
  @Output() userSelected: EventEmitter<any> = new EventEmitter<any>();
  userList: ClientUser[] = [];

  constructor(private navCtrl: NavController, private roomService: RoomService) {
    console.log('Im calling from user page')
  }
  ngAfterViewChecked(): void {
    this.userList = this.userList
  }



  ngOnChanges(changes: SimpleChanges): void {
    console.log('on changes is calling')
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
      this.navCtrl.navigateForward(['/dashBoard/chatbox']);
    } else {
      this.userSelected.emit(user);
    }
  }


  private SetItemToLocalStorage(key: any, values: any) {
    localStorage.setItem(key, JSON.stringify(values));
  }

  ngOnDestroy(): void {

    this.userList = [];
    this.Users = [];

  }

}
