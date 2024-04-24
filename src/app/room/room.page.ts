import { CommonModule } from '@angular/common';
import { Component, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

import { SocketService } from '../socketservice/socket.service';
import { HeaderPage } from './header/header.page';
import { UsersPage } from './users/users.page';
import { ChatboxPage, MSG } from './chatbox/chatbox.page';
import { ClientUser, RoomService } from './room.service';
import { Router, RouterModule } from '@angular/router';


@Component({
    selector: 'app-room',
    templateUrl: 'room.page.html',
    styleUrls: ['room.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, HeaderPage, UsersPage, ChatboxPage, RouterModule],
    providers: [RoomService]
})
export class RoomPage implements OnChanges, OnInit {
    public userList: ClientUser[] = [];
    public selectedUser!: ClientUser;
    constructor(
        private service: SocketService,
        private navCtrl: NavController,
        private roomService: RoomService,
        private router: Router) {
    }
    async ngOnInit() {
        console.log(this.service.getPending())

        this.service.onGetMessage((message: MSG) => {
            if (this.userList.length != 0) {
                const user = this.userList.find((r) => { return r.username === message.from });
                if (!user) {
                    this.getNewUserMsg(message)
                } else {
                    console.log(user)
                }
            } else {
                this.getNewUserMsg(message)
            }

        });
        setTimeout(() => {
            const username = localStorage.getItem('username');
            if (username != null) {
                this.service.getConversationUser(username).subscribe((r: any) => {
                    this.userList = r.user
                })
            }
        }, 1000)
    }

    private getNewUserMsg(message: MSG) {
        console.log(message.from)
        this.roomService.onNewUser(message.from).subscribe((res) => {
            this.userList.push(res.user)
        })
    }
    // getting data from user page
    handleUserSelected(selectedUser: ClientUser) {
        this.selectedUser = selectedUser;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['userList'] && changes['userList'].currentValue) {
            this.service.getUserList().subscribe((res: any[]) => {
                this.userList = res;
                this.userList = this.userList.filter((user: ClientUser) => user.username !== localStorage.getItem('username'));
            });
        }
    }

}