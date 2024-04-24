import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SocketService, User } from 'src/app/socketservice/socket.service';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { timeInterval } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ClientUser, RoomService } from '../room.service';
export interface MSG {
  from: string,
  text: string
}
@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.page.html',
  styleUrls: ['./chatbox.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule,],
  // encapsulation: ViewEncapsulation.None
})
export class ChatboxPage implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('content', { static: false }) content!: ElementRef;
  @Input() selectedUser: ClientUser = {
    _id: '',
    username: '',
    socketId: ''
  };
  messages: MSG[] = []
  newMessage = ''
  fromUser: any = '';
  showChat = false;
  constructor(private route: ActivatedRoute, private service: SocketService, private http: HttpClient, private roomService: RoomService) {
    if (this.forSmallScreen()) {
      this.fromUser = this.getItemFromLocalStorage('username');
      const user: any = this.getItemFromLocalStorage('selectedUser') || null;
      const data = user ? JSON.parse(user) : null;
      this.selectedUser = data;
      if (this.selectedUser && this.selectedUser.username) {
        const toUser = this.selectedUser.username;
        this.service.getConversation(this.fromUser, toUser).subscribe((conversation: any[]) => {
          // Handle conversation data
          localStorage.setItem('conversationData', JSON.stringify(conversation));
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUser'] && changes['selectedUser'].currentValue) {
      this.fromUser = this.getItemFromLocalStorage('username');
      this.setSelectedUserData(this.selectedUser);
      console.log(this.selectedUser)
      if (this.selectedUser && this.selectedUser.username) {
        const toUser = this.selectedUser.username
        this.service.getConversation(this.fromUser, toUser).subscribe((conversation: any[]) => {
          // Handle conversation data
          this.messages = conversation;
        });
      }
    }
  }
  ngOnInit() {
    this.service.onGetMessage((message) => {
      if (this.selectedUser?.username === message.from) {
        this.messages.push(message)
      } else {
        console.log(message + '' + 'im from notification')
      }
    });
    // this.service.getMessage();
  }
  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch(err) { }
  }

  forSmallScreen(): boolean {
    return window.innerWidth < 768;
  }

  sendMessage() {
    const fromUserSocketId = this.getItemFromLocalStorage('socketId');
    const toUserDetails = this.getItemFromLocalStorage('selectedUser');
    if (toUserDetails && fromUserSocketId && this.fromUser != null && this.fromUser !== undefined && this.newMessage.length !== 0) {
      const data = toUserDetails ? JSON.parse(toUserDetails) : null;
      this.messages.push({ from: this.fromUser, text: this.newMessage })
      this.service.sendMessage(this.fromUser, data.username, this.newMessage);
      this.newMessage = '';
    }

  }

  getMessageClass(message: MSG): string {
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
    if (this.roomService.onDestoyComponents) {
      // this.messages = [];
    }
    this.removeFromLocalStorage();
  }

}
