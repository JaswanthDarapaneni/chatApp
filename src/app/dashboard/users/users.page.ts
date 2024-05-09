import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonBadge, IonItem, IonLabel, IonList, NavController } from '@ionic/angular/standalone';
import { SearchbarPage } from '../searchbar/searchbar.page';
import { ClientUser } from '../room/room.service';
import { ChatboxPage } from '../chatbox/chatbox.page';
import { MobchatPage } from '../mobchat/mobchat.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonList, IonBadge, IonLabel, IonItem, IonAvatar, CommonModule, FormsModule, SearchbarPage, MobchatPage]
})
export class UsersPage implements OnDestroy, OnChanges {
  @ViewChild(MobchatPage) mobchatPage!: MobchatPage;
  @Input() Users: ClientUser[] = [];
  @Input() latestMSG: any;
  @Output() userSelected: EventEmitter<any> = new EventEmitter<any>();
  userList: ClientUser[] = [];
  unreadMsg: any[] = [];
  setFlag: any = true;

  constructor(private navCtrl: NavController,) {
    this.removeFromLocalStorage();

  }

  async receiveMessage(message: any | any[]) {
    if (!Array.isArray(message)) {
      message = [message];
    }

    const usersToUpdate: { [username: string]: { fromIndex: number, unreadCount: number } } = {};

    for (const msg of message) {
      if (msg && msg.text) {
        const fromIndex = this.Users.findIndex(user => user.username === msg.from);
        const toIndex = this.Users.findIndex(user => user.username === msg.to);
        const truncatedText = msg.text.length > 16 ? msg.text.slice(0, 16) + '...' : msg.text;

        if (fromIndex !== -1 && !usersToUpdate[msg.from]) {
          const existingUnreadCount = this.Users[fromIndex].unreadCount || 0;
          usersToUpdate[msg.from] = { fromIndex, unreadCount: existingUnreadCount };
        }

        if (toIndex !== -1) {
          const userToUpdate = this.Users[toIndex];
          userToUpdate.latestText = truncatedText;
          this.Users.splice(toIndex, 1, userToUpdate);
        }

        if (fromIndex !== -1) {
          const userToUpdate = this.Users[fromIndex];
          userToUpdate.latestText = truncatedText;

          const selectedUser: any = localStorage.getItem('selectedUser');
          const toUser = selectedUser ? JSON.parse(selectedUser) : null;
          if (!toUser || toUser.username !== msg.from) {
            usersToUpdate[msg.from].unreadCount++;
          }

          this.Users.splice(fromIndex, 1, userToUpdate);
        }
      }
    }

    for (const [username, { fromIndex, unreadCount }] of Object.entries(usersToUpdate)) {
      if (fromIndex !== -1) {
        this.Users[fromIndex].unreadCount = +unreadCount;
      }
    }

    // Append new unread messages to the existing unreadMsg array
    const newUnreadMessages = message.filter((msg: any) => {
      const selectedUser: any = localStorage.getItem('selectedUser');
      const toUser = selectedUser ? JSON.parse(selectedUser) : null;
      return !toUser || toUser.username !== msg.from;
    });
    this.unreadMsg.push(...newUnreadMessages);
  }

  ngOnChanges(changes: any): void {
    if (changes['Users'] && changes['Users'].currentValue) {
      this.userList = this.Users;
    }
  }

  handleUserSelected(user: ClientUser) {
    this.navigateToChat(user);
    this.Users.push(user);
  }

  navigateToChat(user: ClientUser) {
    if (window.innerWidth < 768) {
      if (user.username) {
        this.updateUnreadCount(user.username, 0);
      }
      this.navCtrl.navigateForward('dashBoard/mobchatbox');

      this.SetItemToLocalStorage('selectedUser', { username: user.username, socketId: user.socketId, _id: user._id });

    } else {
      if (user.username) {
        this.userSelected.emit(user);
        this.updateUnreadCount(user.username, 0);
      }
    }
  }

  private updateUnreadCount(username: string, count: number) {
    const index = this.Users.findIndex(user => user.username === username);
    if (index !== -1) {
      this.Users[index].unreadCount = count;
      this.unreadMsg = [];
    }
  }

  private SetItemToLocalStorage(key: any, values: any) {
    localStorage.setItem(key, JSON.stringify(values));
  }

  private removeFromLocalStorage() {
    localStorage.removeItem('selectedUser');
  }

  ngOnDestroy(): void {
    this.userList = [];
    this.Users = [];
  }

}
