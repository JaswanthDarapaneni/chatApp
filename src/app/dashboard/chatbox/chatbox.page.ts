import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SocketService } from 'src/app/socketservice/socket.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ClientUser, Message } from '../room/room.service';
import { ChatBoxService } from './chatbox.service';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.page.html',
  styleUrls: ['./chatbox.page.scss'],
  standalone: true,
  providers: [ChatBoxService],
  imports: [
    IonBackButton, IonButtons,
    IonInput, IonButton, IonHeader, IonFooter, IonItem, IonLabel, IonList, IonContent, IonTitle, IonToolbar, CommonModule, FormsModule, HttpClientModule],
  // encapsulation: ViewEncapsulation.None
})
export class ChatboxPage implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('content', { static: false }) content!: ElementRef;
  @Input() selectedUser: ClientUser = {
    _id: '',
    username: '',
    socketId: '',
  };
  messages: Message[] = []
  newMessage = ''
  fromUser: any = '';
  toUser: any = ''
  showChat = false;
  constructor(
    private service: SocketService,
    private chatBoxService: ChatBoxService) {
      console.log('im initiating form chatBOx')

    this.initialize();
  }

  async initialize() {
    if (this.forSmallScreen()) {
      this.fromUser = this.getItemFromLocalStorage('username');
      const user: any = this.getItemFromLocalStorage('selectedUser') || null;
      this.selectedUser = user ? JSON.parse(user) : null;
      if (this.selectedUser && this.selectedUser.username) {
        this.toUser = this.selectedUser.username;
        const chat = await this.chatBoxService.getData(this.toUser);
        this.messages = chat ? chat : [];
      }
    }
  }


  async ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedUser'] && changes['selectedUser'].currentValue) {
      this.fromUser = this.getItemFromLocalStorage('username');
      this.setSelectedUserData(this.selectedUser);
      if (this.selectedUser && this.selectedUser.username) {
        this.toUser = this.selectedUser.username;
        const chat = await this.chatBoxService.getData(this.toUser);
        this.messages = chat ? chat : [];
      }
    }
  }
  ngOnInit() {
    this.messages = [];
    this.service.onGetMessage(async (message) => {
      const isFromSelectedUser = this.toUser === message.from;
      const chat = isFromSelectedUser ? await this.chatBoxService.getData(message.from) : null;
      if (isFromSelectedUser) {
        this.messages = chat ? [...chat, message] : [message];
        this.messages.push(message);
        this.chatBoxService.storeData(message.from, this.messages);
      } else {
        console.log(message + '' + 'im from notification')
      }
      if (isFromSelectedUser) {
        await this.chatBoxService.storeData(message.from, this.messages);
      }
    });
  }
  ngAfterViewInit() {
  }

  forSmallScreen(): boolean {
    return window.innerWidth < 768;
  }

  async sendMessage() {
    const fromUserSocketId = this.getItemFromLocalStorage('socketId');
    const toUserDetails = this.getItemFromLocalStorage('selectedUser');
    if (toUserDetails && fromUserSocketId && this.fromUser != null && this.fromUser !== undefined && this.newMessage.length !== 0) {
      const data = toUserDetails ? JSON.parse(toUserDetails) : null;
      this.messages = this.messages || [];
      this.messages.push({
        from: this.fromUser,
        text: this.newMessage,
        to: data.username,
      });
      let chatdata = await this.chatBoxService.getData(data.username)
      let message = {
        from: this.fromUser,
        text: this.newMessage,
        to: data.username,
      }
      if (chatdata) {
        chatdata.push(message);
        await this.chatBoxService.storeData(data.username, chatdata);
      } else {
        await this.chatBoxService.storeData(data.username, [message]);
      }
      this.service.sendMessage(this.fromUser, data.username, this.newMessage);
      this.newMessage = '';
    }
  }


  getMessageClass(message: Message): string {
    return message.from === this.fromUser ? 'sender-right' : 'sender-left';
  }


  private setSelectedUserData(data: ClientUser | null | undefined) {
    if (data != null) {
      this.SetItemToLocalStorage('selectedUser', { username: data.username, socketId: data.socketId, _id: data._id })
    }
  }


  private SetItemToLocalStorage(key: any, values: any) {
    localStorage.setItem(key, JSON.stringify(values));
  }

  private getItemFromLocalStorage(key: any) {
    return localStorage.getItem(key);
  }

  private removeFromLocalStorage() {
    localStorage.removeItem('selectedUser')
  }

  ngOnDestroy(): void {
    this.messages = [];
    if (this.chatBoxService.onDestoyComponents) {
      this.messages = [];
    }
    this.removeFromLocalStorage();
  }

}
