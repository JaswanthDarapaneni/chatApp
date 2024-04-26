import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SocketService } from '../../socketservice/socket.service';
import { HeaderPage } from '../header/header.page';
import { UsersPage } from '../users/users.page';
import { ChatboxPage } from '../chatbox/chatbox.page';
import { ClientUser, Message, RoomService, UserConversationResponse, UserWithConversation } from './room.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonNavLink } from '@ionic/angular/standalone';


@Component({
    selector: 'app-room',
    templateUrl: 'room.page.html',
    styleUrls: ['room.page.scss'],
    standalone: true,
    imports: [
        IonNavLink,
        IonicModule, CommonModule, FormsModule, HeaderPage, UsersPage, ChatboxPage, RouterModule, HttpClientModule],
    providers: [RoomService, SocketService]
})
export class RoomPage implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    initialize = false;
    initialized = false;
    public userList: ClientUser[] = [];
    public userdata: UserConversationResponse[] = [];
    public selectedUser!: ClientUser;
    constructor(
        private service: SocketService,
        private roomService: RoomService,
        private cdr: ChangeDetectorRef
    ) { }
    ngAfterViewInit(): void {
    }
    async ngOnInit() {
        if (!this.initialized) {
            this.initializeComponent();
        }
        this.cdr.detectChanges();

    }
    initializeComponent() {
        this.getUserKeys();
        this.listenForMessages();
        this.initialize = true
        this.initialized = true;
    }



    listenForMessages() {
        this.service.onGetMessage(async (message: Message) => {
            if (this.userList.length !== 0) {
                const senderUser = this.userList.find((user: ClientUser) => user.username === message.from);
                if (!senderUser) {
                    this.handleNewMessageFromNewUser(message);
                } else {
                    await this.handleExistingUserMessage(senderUser, message);
                }
            } else {
                this.handleNewMessageFromNewUser(message);
            }
        });
    }
    private async handleNewMessageFromNewUser(message: Message) {
        this.getNewUserMsg(message);
        await this.roomService.storeData(message.from, [message]);
    }

    private async handleExistingUserMessage(user: ClientUser, message: Message) {
        if (user.username) {
            const userChat = await this.roomService.getData(user.username);
            if (userChat) {
                userChat.push(message);
                await this.roomService.storeData(user.username, userChat);
            }
        }
    }

    private getNewUserMsg(message: Message) {
        this.roomService.onNewUser(message.from).subscribe((res) => {
            this.userList.push(res.user)
        })
    }
    async getUserKeys() {
        try {
            const keys: any = await this.roomService.getAllUserDetails();
            this.userList = keys.map((key: any) => ({ username: key, _id: '', socketId: '' }));
            // this.presentLoading();
        } catch (error) {
            console.error('Error retrieving user keys:', error);
        } finally {
            // Dismiss loading indicator after data retrieval
        }
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

    ngOnDestroy(): void {
        this.userList = [];
        this.selectedUser = {}
        this.roomService.destroyeIndexDb();
    }


}