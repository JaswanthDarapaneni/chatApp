import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ConnectionStatusChangeListener, Network, NetworkStatus, NetworkStatusChangeCallback } from '@capacitor/network';

import { SocketService } from '../../socketservice/socket.service';
import { HeaderPage } from '../header/header.page';
import { UsersPage } from '../users/users.page';
import { ChatboxPage } from '../chatbox/chatbox.page';
import { ClientUser, Message, RoomService, UserConversationResponse, UserWithConversation } from './room.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonModal, IonNavLink, IonRouterOutlet, ModalController, NavController } from '@ionic/angular/standalone';
import { OnlineOfflineService } from 'src/app/internetService/online-offline.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-room',
    templateUrl: 'room.page.html',
    styleUrls: ['room.page.scss'],
    standalone: true,
    imports: [
        IonNavLink,
        IonicModule, CommonModule, FormsModule, HeaderPage, UsersPage, ChatboxPage, RouterModule, IonRouterOutlet, HttpClientModule],
    providers: [RoomService, SocketService, OnlineOfflineService]
})
export class RoomPage implements OnChanges, OnInit, OnDestroy {
    @Output() latestMSG: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(UsersPage) userPageComponent!: UsersPage;
    @ViewChild(ChatboxPage) chatComponent!: ChatboxPage;

    public userList: ClientUser[] = [];
    public userdata: UserConversationResponse[] = [];
    public selectedUser!: ClientUser;
    private onlineStatusSubscription!: Subscription;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    constructor(
        private service: SocketService,
        private roomService: RoomService,
        private onlineOfflineService: OnlineOfflineService,
    ) {
        this.doOperationsWhenOnline()
    }
    async ngOnInit() {
        this.service.connectSocket();
        this.getUserList();
        // When ever you get into online you will recive the your frinds data.. with uniqueId. it similer to the below method. but this active when user online. 
        this.service.calltrakingOfMsg((res: any) => {
            this.TrakingMsgSTatusUpdate(res)
        })
        // Track the single user status.. when your frined get into online and he recived your msg.. you get msg status throw this function 
        this.service.gettingInformationOffriendRecivedMsg((track: any) => {
            this.trackSingleUser(track);
        })

        // This is importent method. don't change anything on this.
        this.service.checkingClientFromServer();

        //  When your friend is get online
        this.service.receveidMsgConfirmation(async (response) => {
            this.confirmSendingOfflineMsgs(response)
        });
        //  Calling offline MSG when user2 get into online
        this.service.checkUpdates((data: any) => {
            const filter = data.data.data.filter((sender: any) => sender.messages.length > 0);
            this.pushOfflineData(filter.data);
        })

        // On get message while both users online
        this.roomService.onGetMessage(async (message: any) => {
            if (this.userList.length !== 0) {
                const senderUser = this.userList.find((user: ClientUser) => user.username === message.sender.username);
                if (!senderUser) {
                    this.handleNewMessageFromNewUser(message);
                } else {
                    await this.handleExistingUserMessage(message);
                }
            } else {
                this.handleNewMessageFromNewUser(message);
            }
        });

        this.onlineStatusSubscription = this.onlineOfflineService.getOnlineStatus().subscribe(async (isOnline: boolean) => {
            if (isOnline) {
                // connecting To socket
                this.service.connectSocket();
                this.doOperationsWhenOnline()
            } else {
                console.log('Offline');
            }
        });
    }

    doOperationsWhenOnline(): void {
        this.service.afterGettingIntoOnline(
            (offline: any) => {
                if (offline?.data != null) {
                    const sendersWithMessages = offline.data.data.filter((sender: any) => sender.messages.length > 0);
                    this.pushOfflineData(sendersWithMessages);
                    this.service.trackingConfirmationToFriend(sendersWithMessages);
                }
            },
            (pending: any) => {
                if (pending?.data != null) {
                    const sendersWithMessages = pending.data.data.filter((res: any) => res.messages.length > 0);
                    this.pushOfflineData(sendersWithMessages);
                    this.service.trackingConfirmationToFriend(sendersWithMessages);
                }
            }
        );

        setTimeout(() => {
            this.service.addOfflineMsgThrowApi()?.pipe(
                takeUntil(this.ngUnsubscribe) // Unsubscribe when ngUnsubscribe emits
            ).subscribe(
                (response: any) => {
                    if (response.code === 200) {
                        if (response.ids) { this.confirmSendingOfflineMsgs(response.ids); }
                        for (const id of response.ids) {
                            this.roomService.informUsers(id, (success: any) => {
                                // console.log(success)
                                this.confirmOfflineMsgRecivedOrNot(success);
                            });
                        }
                    }
                },
                (error) => {
                    console.error(error);
                }
            );
        }, 3000);
    }

    handleMessageSent(message: string) {
        // Pass the message to the user page component
        this.userPageComponent.receiveMessage(message);
    }

    private async TrakingMsgSTatusUpdate(data: any) {
        // Ensure only one execution
        const selectedUserStr: any | null = localStorage.getItem('selectedUser');
        const selectedUser: any = JSON.parse(selectedUserStr);
        if (!data || !data[0]?.traking) return;
        for (const track of data[0]?.traking) {
            const user = this.userList.find((r) => r._id === track.reciver_id);
            if (!user) continue;
            const key = `_id:${user._id},username:${user.username}`;
            const chatdata = await this.roomService.getData(key);
            if (!chatdata) continue;
            const trakingMessages = chatdata.filter((message: any) => track.unique.includes(message.uniqueId));
            // Send pending messages
            await Promise.all(trakingMessages.map(async (message: any) => {
                try {
                    // Update message status
                    const index = chatdata.indexOf(message);
                    if (index !== -1) {
                        chatdata[index].isSended = true;
                        chatdata[index].isRecived = true;
                    }
                    // Store updated chat data
                    await this.roomService.storeData(key, chatdata);
                    // Send updated message to chat component if selected user is the receiver
                    if (selectedUser != null && selectedUser?._id && selectedUser.username === message.to) {
                        this.chatComponent.triggerUpdate(message, key);
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            }));
        }
    }

    private async trackSingleUser(track: any) {
        const selectedUserStr: any | null = localStorage.getItem('selectedUser');
        const selectedUser: any = JSON.parse(selectedUserStr);
        this.updateStatus(selectedUser, track.id, true, true)
    }

    /* **************************************************************  */
    //  To Handile OnGetMsg while chatting
    private async handleNewMessageFromNewUser(message: any) {
        const status = await this.getNewUserMsg(message);
        if (status) {
            // console.log('Received message from new user');
            // console.log(message.messages)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second (optional)
            const key = `_id:${message.sender._id},username:${message.sender.username}`;
            if (Array.isArray(message.messages)) {
                message.messages.forEach((r: any) => {
                    this.userPageComponent.receiveMessage(r);
                })
                await this.roomService.storeData(key, message.messages);
            } else {
                await this.roomService.storeData(key, [message.messages]);
                this.userPageComponent.receiveMessage(message.messages);
            }
        } else {
            // console.log('No new user message received');
        }
    }

    private async handleExistingUserMessage(message: any) {
        const key = `_id:${message.sender._id},username:${message.sender.username}`;
        const userChat = await this.roomService.getData(key);
        if (userChat) {
            if (Array.isArray(message.messages)) {
                // console.log('Is array')
                message.messages.forEach((r: any) => {
                    this.userPageComponent.receiveMessage(r);
                    // this.chatComponent.pushPendingMsgFromRoom(r);
                    userChat.push(r);
                })
                await this.roomService.storeData(key, userChat);
            } else {
                // console.log('Is normal')
                userChat.push(message.messages);
                await this.roomService.storeData(key, userChat);
                this.userPageComponent.receiveMessage(message.messages);
                // this.chatComponent.pushPendingMsgFromRoom(message.messages);

            }

        }
    }

    private async handleNotSelcetedUser(pendingMessages: any) {
        for (const data of pendingMessages) {
            const senderUsername = data.sender?.username;
            try {
                if (this.isUserInList(senderUsername)) {
                    // console.log('im calling user exited')
                    this.handlePendingMessage(data, false);
                } else {
                    // console.log('im calling user not exited')
                    this.handleNewPendingMessage(data);
                }
            } catch (error) {
                console.error('Error processing pending message:', error);
                // Handle the error appropriately, e.g., log it or display an error message
            }
        }
    }

    // to handile the pending Msg
    private async handleNewPendingMessage(message: any) {
        const status = await this.getNewUserMsg(message);
        if (status) {
            await this.delay(1000);
            const key = this.getKeyFromMessage(message);
            const messagesToStore = Array.isArray(message.messages) ? message.messages : [message.messages];
            await this.storeMessages(key, messagesToStore);
            await this.userPageComponent.receiveMessage(messagesToStore);
        } else {
            // console.log('No new user message received');
        }
    }

    private async handlePendingMessage(message: any, status: boolean) {
        const key = this.getKeyFromMessage(message);
        const userChat = await this.roomService.getData(key);
        if (userChat) {
            // console.log('User chat exists');
            const messagesToStore = Array.isArray(message.messages) ? message.messages : [message.messages];
            for (const msg of messagesToStore) {
                userChat.push(msg);
                if (status) await this.chatComponent.pushPendingMsgFromRoom(msg);
            }
            this.userPageComponent.receiveMessage(messagesToStore);
            await this.storeMessages(key, userChat);
        } else {
            // console.log('User chat not found');
        }
    }

    // Cheking the offline msg are recived or not.. 
    private async confirmOfflineMsgRecivedOrNot(receivedUser: any) {
        if (receivedUser.length === 0) return;
        const selectedUser = JSON.parse(localStorage.getItem('selectedUser') || '{}');
        if (receivedUser[0].success) {
            // updting item when when offiline msg send ... to user2, if user 2 is online, recived a messge then,i update. 
            await this.updateStatus(selectedUser, receivedUser[0].sender.userId, true, true)
            localStorage.removeItem('unsentMessages');
        }
    }
    // when ever the offline msg send too the server.. this will make the call. and ste msg as sended true.
    private async confirmSendingOfflineMsgs(ids: any) {
        if (!ids) return;
        console.log(Array.isArray(ids))
        const selectedUser = JSON.parse(localStorage.getItem('selectedUser') || '{}');
        if (Array.isArray(ids)) {
            ids.forEach(async (userId: any) => {
                console.log('calling update status1')
                await this.updateStatus(selectedUser, userId, true, false);
            })
        }

        if (!Array.isArray(ids)) {
            console.log('calling update its id not array')
            await this.updateStatus(selectedUser, ids, true, true)
        }
        localStorage.removeItem('unsentMessages');
    }

    private async updateStatus(selectedUser: any, userId: any, sended?: any, received?: any, seen?: any) {

        const filterPendingMessages = (roomData: any[], isSended?: any, isReceived?: any, isSeen?: any): any[] => {
            if (isSended && isReceived) {
                console.log('imcalling')
                return roomData.filter((message: any) => { if (message.isRecived === false) return message });
            } else {
                console.log('imcalling else')
                return roomData.filter((message: any) => { if (message.isSended === false) return message });
            }
        }
        const client = this.userList.find((user: ClientUser) => user?._id === userId);
        if (!client) return;
        const key = `_id:${client._id},username:${client.username}`;
        const roomData = await this.roomService.getData(key);
        if (!roomData) return;
        const pendingMessages = filterPendingMessages(roomData, sended, received, seen);
        // const pendingMessages = roomData.filter((message: any) => message.isSended === false);
        await Promise.all(pendingMessages.map(async (message: any) => {
            try {
                const { from, to, text } = message;
                const index = roomData.indexOf(message);
                if (index !== -1) {
                    roomData[index].isSended = sended;
                    roomData[index].isRecived = received;
                }

                if (selectedUser?._id && selectedUser?.username === to) {
                    this.chatComponent.triggerUpdate(message, key);
                }

                await this.storeMessages(key, roomData);

            } catch (error) {
                console.error('Error sending message:', error);
            }
        }));
    }

    private pushOfflineData(data: any) {
        const selectedUserStr = localStorage.getItem('selectedUser');
        const selectedUser = selectedUserStr ? JSON.parse(selectedUserStr) : null;
        if (!data || !data.data || data.data.length === 0) {
            return; // Return immediately if there is no data or no messages
        }

        if (selectedUser && selectedUser._id) {
            const existingMessageIndex = data.data.findIndex((data: any) => data.sender?._id === selectedUser._id);
            if (existingMessageIndex !== -1) {
                const existingMessage = data.data[existingMessageIndex];
                data.data.splice(existingMessageIndex, 1);
                this.handlePendingMessage(existingMessage, true);
            }
        }
        // console.log(data.data)
        this.handleNotSelcetedUser(data.data)
    }

    /* **************************************************************  */
    private getNewUserMsg(message: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.roomService.onNewUser(message.sender?.username).subscribe((res) => {
                if (res) {
                    this.userList.push(res.user);
                    resolve(true)
                } else {
                    resolve(false);
                }
            });
        });
    }
    // getting userList and this is for test perpose i had saparated the unsend msg.. in feature i use this
    private async getUserList() {
        const storedUsers: ClientUser[] = await this.roomService.getAllKeys();
        const username = localStorage.getItem('username');
        if (!username) return;
        for (const users of storedUsers) {
            const key = `_id:${users._id},username:${users.username}`;
            const userChat = await this.roomService.getData(key);
            if (!userChat) return;
            let unReadMsg: any[] = [];
            let unSendMsg: any[] = [];
            let unSeenMsg: any[] = [];
            userChat.filter((chat: any) => {
                if (chat.from === username) {
                    if (chat.isSended && chat.isRecived && !chat.isSeen) unSeenMsg.push(chat);
                    if (chat.isSended && !chat.isRecived) unReadMsg.push(chat);
                    if (!chat.isSended) unSendMsg.push(chat);
                }
            })
            if (userChat.length != 0) {
                const index = userChat.length - 1;
                users.latestText = userChat[index].text;
                users.UnreceivedMessages = unReadMsg;
                users.UnseenMessages = unSeenMsg;
                users.UnsentMessages = unSendMsg;
                this.userList.push(users)
            }
        }
    }
    // getting data from user page
    handleUserSelected(selectedUser: ClientUser) {
        this.selectedUser = selectedUser;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['userList'] && changes['userList'].currentValue) {
            this.userList = this.userList;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private isUserInList(username: string | undefined): boolean {
        return !!username && this.userList.some((user: ClientUser) => user?.username === username);
    }

    private getKeyFromMessage(message: any): string {
        return `_id:${message.sender._id},username:${message.sender.username}`;
    }

    private async storeMessages(key: string, messages: any[]): Promise<void> {
        await this.roomService.storeData(key, messages);
    }

    ngOnDestroy(): void {
        this.userList = [];
        this.selectedUser = {
            unreadCount: 0
        }
        this.roomService.destroyeIndexDb();
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


}