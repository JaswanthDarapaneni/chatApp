import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ChatPage } from '../chat/chat.page';
import { SocketService, User } from '../socketservice/socket.service';
import { HeaderPage } from './header/header.page';
import { UsersPage } from './users/users.page';
import { ChatboxPage } from './chatbox/chatbox.page';
import { SearchbarPage } from './searchbar/searchbar.page';


@Component({
    selector: 'app-room',
    templateUrl: 'room.page.html',
    styleUrls: ['room.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, ChatPage, HeaderPage, UsersPage, ChatboxPage, SearchbarPage],
    providers: []
})
export class RoomPage implements OnChanges{
    public userList: User[] = []
    public selectedUser!: User;
    constructor(private service: SocketService) {
        this.service.connect();
        this.service.getUserList().subscribe((res: User[]) => {
            this.userList = res;
            this.userList = this.userList.filter((user) => user.userId !== localStorage.getItem('username'));
            this.selectedUser = this.userList[0];
            console.log(this.selectedUser)
            
        });
    }
    // getting datat from user page
    handleUserSelected(selectedUser: User) {
        this.selectedUser = selectedUser;
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['userList'] && changes['userList'].currentValue) {
            this.service.getUserList().subscribe((res: User[]) => {
                this.userList = res;
                this.userList = this.userList.filter((user) => user.userId !== localStorage.getItem('username'));
            });
        }

    }

}