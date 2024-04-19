import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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
    imports: [ IonicModule, CommonModule, FormsModule, HeaderPage, UsersPage, ChatboxPage],
    providers: []
})
export class RoomPage implements OnChanges, OnInit {
    public userList: any[] = [];
    public selectedUser!: User;
    constructor(private service: SocketService,) { 
        
    }
    ngOnInit(): void {
          this.service.onGetMessage((message) => {
            // this.messages.push(message)
            console.log(message)
            // Handle incoming message
          });
        // this.service.connect();
        const username = localStorage.getItem('username')
        this.service.getConversationUser(username).subscribe((r: any) => {
            this.userList = r.user
        })
    }
    handleRefresh(r: any) { }
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