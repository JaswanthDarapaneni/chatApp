import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from 'src/app/socketservice/socket.service';
import { IonicModule, NavController } from '@ionic/angular';
import { SearchbarPage } from '../searchbar/searchbar.page';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SearchbarPage]
})
export class UsersPage implements OnInit, OnChanges {
  @Input() Users: any[] = [];
  @Output() userSelected: EventEmitter<any> = new EventEmitter<any>();
  userList: any[] = [];

  constructor(private navCtrl: NavController) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Users'] && changes['Users'].currentValue) {
      this.userList = this.Users
    }
  }
  handleUserSelected(user: any) {
    this.navigateToChat(user);
    this.Users.push(user);
  }

  navigateToChat(user: any) {
    if (window.innerWidth < 768) {
      this.navCtrl.navigateForward(['room/chatbox', { user }]);
    } else {
      this.userSelected.emit(user);
    }
  }

  ngOnInit() {
  }

}
