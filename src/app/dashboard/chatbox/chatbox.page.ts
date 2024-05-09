import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SocketService } from 'src/app/socketservice/socket.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ClientUser, Message, UserWithConversation } from '../room/room.service';
import { ChatBoxService } from './chatbox.service';
import { addIcons } from 'ionicons';
import { checkmarkOutline, checkmarkDoneOutline, checkmarkDone, timer } from 'ionicons/icons';
import { Subscription, timestamp } from 'rxjs';
import { RoomPage } from '../room/room.page';


@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.page.html',
  styleUrls: ['./chatbox.page.scss'],
  standalone: true,
  providers: [ChatBoxService],
  imports: [

    IonBackButton, IonButtons, IonIcon,
    IonInput, IonButton, IonHeader, IonFooter, IonItem, IonLabel, IonList, IonContent, IonTitle, IonToolbar, CommonModule, FormsModule, HttpClientModule],
  // encapsulation: ViewEncapsulation.None
})
export class ChatboxPage implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  // @ViewChild('content', { static: false }) content!: ElementRef;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  lastSeenMessageIndex: number = -1;
  private onlineStatusSubscription!: Subscription;
  @Output() messageSent: EventEmitter<any> = new EventEmitter<any>();

  @Input() selectedUser: ClientUser = {
    _id: '',
    username: '',
    socketId: '',
    unreadCount: 0
  };

  messages: Message[] = []
  newMessage = ''
  fromUser: any = '';
  toUser: any = ''
  showChat = false;
  msgStatus!: boolean

  constructor(
    private service: SocketService,
    private chatBoxService: ChatBoxService,
    private roomComponent: RoomPage,
    private cdr: ChangeDetectorRef) {
    this.initialize();
    addIcons({
      'pending-icon': timer,
      'checkmark-outline': checkmarkOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'arrow-forward-outline': checkmarkDone
    })
  }
  ngAfterViewInit(): void {
    // this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.content && this.messages.length > 0) {
      this.content.scrollToBottom();
    }
    // this.content.scrollToBottom(500);
  }

  async initialize() {
    if (this.forSmallScreen()) {
      this.fromUser = this.getItemFromLocalStorage('username');
      const user: any = this.getItemFromLocalStorage('selectedUser') || null;
      this.selectedUser = user ? JSON.parse(user) : null;
      if (this.selectedUser && this.selectedUser.username) {
        this.toUser = this.selectedUser.username;
        const key = `_id:${this.selectedUser._id},username:${this.selectedUser.username}`;
        const chat = await this.chatBoxService.getData(key);
        this.messages = chat ? chat : [];
      }
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedUser'] && changes['selectedUser'].currentValue) {
      // this.scrollButtom()
      this.fromUser = this.getItemFromLocalStorage('username');
      this.setSelectedUserData(this.selectedUser);
      if (this.selectedUser && this.selectedUser.username) {
        this.toUser = this.selectedUser.username;
        const key = `_id:${this.selectedUser._id},username:${this.selectedUser.username}`;
        const chat = await this.chatBoxService.getData(key);
        this.messages = chat ? chat : [];
      }
    }
  }
  ngOnInit() {
    // this.scrollButtom()
    this.loadMessages();
  }

  async loadMessages() {
    this.messages = [];
    const selectedUser = this.getSelectedUserFromLocalStorage();

    if (!selectedUser || !selectedUser.username) {
      console.error('Selected user is missing or invalid.');
      return;
    }

    this.service.onGetMessage(async (message) => {
      const isFromSelectedUser = this.toUser === message.sender.username;

      if (!isFromSelectedUser) {
        // console.log('Message is not from the selected user.');
        return;
      }

      const key = `_id:${message.sender._id},username:${message.sender.username}`;
      let chat: any[] = await this.chatBoxService.getData(key);

      if (!chat) {
        console.error('Failed to retrieve chat data.');
        return;
      }
      this.messages.push(message.messages[0]);
      chat.push(message.messages[0]);
      const lastIndex = this.messages.length - 1;
      this.messageSent.emit(this.messages[lastIndex]);
      await this.chatBoxService.storeData(key, chat);
    });
  }

  async pushPendingMsgFromRoom(message: any) {
    this.messages.push(message);
  }
  scrollIntoView(elementId: string) {
    const element = document.getElementById(elementId);
    // console.log(element)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }
  }

  scrollToLastSeenMessage() {
    if (this.content && this.lastSeenMessageIndex >= 0) {
      const lastSeenMessageElement = document.getElementById(`message_${this.lastSeenMessageIndex}`);
      if (lastSeenMessageElement) {
        lastSeenMessageElement.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }
  forSmallScreen(): boolean {
    return window.innerWidth < 768;
  }

  async triggerUpdate(message: any, key: any) {
    const index = this.messages.findIndex((msg: any) => msg.uniqueId === message.uniqueId);
    // console.log(index)
    if (index !== -1) {
      this.messages[index].isSended = message.isSended;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.messages[index].isRecived = message.isRecived;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  async sendMessage() {
    const fromUserSocketId = this.getItemFromLocalStorage('socketId');
    const toUserDetails = this.getItemFromLocalStorage('selectedUser');
    const now = new Date();
    if (!toUserDetails || !fromUserSocketId || !this.fromUser || this.newMessage.length === 0) {
      return; // Exit early if required data is missing
    }
    const data = JSON.parse(toUserDetails);
    const key = `_id:${data._id},username:${data.username}`;
    const uniqueId = Math.random().toString(36).substr(2, 9);
    this.messages = this.messages || [];
    const chatdata: any[] = await this.chatBoxService.getData(key);
    if (navigator.onLine) {
      this.chatBoxService.presentToast('online');
      this.service.sendMessage(uniqueId, this.fromUser, data.username, this.newMessage).then(async (success: any) => {

        const messageData = {
          from: this.fromUser,
          to: data.username,
          text: this.newMessage,
          isSended: true,
          isRecived: success,
          isSeen: false,
          timestamp: now,
          uniqueId: uniqueId
        };

        this.newMessage = '';
        const message = { ...messageData };

        this.messages.push(message);

        if (chatdata) {
          chatdata.push(message);
          this.messageSent.emit(message);
          await this.chatBoxService.storeData(key, chatdata);
        } else {
          await this.chatBoxService.storeData(key, [message]);
        }
        if (chatdata) {
          chatdata.push(message);
          this.messageSent.emit(message);
          await this.chatBoxService.storeData(key, chatdata);
        } else {
          await this.chatBoxService.storeData(key, [message]);
        }
      }).catch(error => {
        console.log(error)
      })
    } else {
      this.chatBoxService.presentToast('Offline');
      console.log('imcalling error')
      const reciverKey = { _id: data._id, username: data.username }
      const messageData = {
        from: this.fromUser,
        to: data.username,
        text: this.newMessage,
        isSended: false,
        isRecived: false,
        isSeen: false,
        timestamp: now,
        key: reciverKey,
        uniqueId: uniqueId
      };
      this.newMessage = '';
      const message = { ...messageData };
      this.messages.push(message);
      if (chatdata) {
        chatdata.push(message);
        this.messageSent.emit(message);
        await this.chatBoxService.storeData(key, chatdata);
      } else {
        await this.chatBoxService.storeData(key, [message]);
      }
      setTimeout(() => {
        const unsentMessages = JSON.parse(localStorage.getItem('unsentMessages') || '[]');
        unsentMessages.push(message);
        localStorage.setItem('unsentMessages', JSON.stringify(unsentMessages));
      }, 1000)
    }
  }

  getMessageClass(message: Message): string {
    if (message.from) {
      const isSenderRight = message.from === this.fromUser;
      this.msgStatus = isSenderRight; // Set msgStatus based on whether the message is on the right side or left side
      return isSenderRight ? 'sender-right' : 'sender-left';
    } else {
      return ''
    }
    // Return the appropriate class based on the sender
  }

  private setSelectedUserData(data: ClientUser | null | undefined) {
    if (data != null) {
      this.SetItemToLocalStorage('selectedUser', { username: data.username, socketId: data.socketId, _id: data._id })
    }
  }

  private getSelectedUserFromLocalStorage(): any {
    const userStr = localStorage.getItem('selectedUser');
    return userStr ? JSON.parse(userStr) : null;
  }


  private SetItemToLocalStorage(key: any, values: any) {
    localStorage.setItem(key, JSON.stringify(values));
  }

  private getItemFromLocalStorage(key: any) {
    return localStorage.getItem(key);
  }

  ngOnDestroy(): void {
    this.messages = [];
    if (this.chatBoxService.onDestoyComponents) {
      this.messages = [];
    }
  }

}
