import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SocketService, User } from 'src/app/socketservice/socket.service';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { timeInterval } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
export interface MSG {
  from: string,
  text: string
}
@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.page.html',
  styleUrls: ['./chatbox.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class ChatboxPage implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() selectedUser: any | undefined;
  toDetails: User | undefined;
  messages: MSG[] = []
  newMessage = ''
  fromUser: any = '';
  showChat = false;
  constructor(private route: ActivatedRoute, private service: SocketService, private http: HttpClient) {

  }
  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUser'] && changes['selectedUser'].currentValue) {
      this.setSelectedUserData(this.selectedUser);
      this.fromUser = this.getItemFromLocalStorage('username');
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
      this.messages.push(message)
      console.log(message)
      // Handle incoming message
    });
    this.service.onConversation((conversation) => {
      console.log(conversation)
      // Handle conversation history
    });

    this.service.listenForNewMessages().subscribe((sender: string) => {
      // Update the list of senders
      console.log(sender)
      // if (!this.senders.includes(sender)) {
      //   this.senders.push(sender);
      // }
    });
    // this.service.getMessage();
    if (window.innerWidth < 768) {
      this.setSelectedUserData(null);
    }
  }

  sendMessage() {
    const fromUserSocketId = this.getItemFromLocalStorage('socketId');
    const toUserDetails = this.getItemFromLocalStorage('selectedUser');
    if (toUserDetails && fromUserSocketId && this.fromUser != null || undefined) {
      const data = toUserDetails ? JSON.parse(toUserDetails) : null;
      this.messages.push({ from: this.fromUser, text: this.newMessage })
      this.service.sendMessage(this.fromUser, data.username, this.newMessage);
      // this.service.getConversation(this.fromUser,data.userId)
    }

    this.newMessage
  }

  getMessageClass(message: any): string {
    return message === this.fromUser ? 'message-container sent' : 'message-container received';
  }

  private setSelectedUserData(data: any | null | undefined) {
    if (data != null) {
      this.SetItemToLocalStorage('selectedUser', { username: data.username, socketId: data.socketId })
      // this.getConversation();
    }
    else {
      this.route.params.subscribe(params => {
        this.SetItemToLocalStorage('selectedUser', { username: params['userId'], socketId: params['socketId'] })
        // this.getConversation();
      });
    }
  }

  // private getConversation() {
  //   this.fromUser = this.getItemFromLocalStorage('username');
  //   const fromUserSocketId = this.getItemFromLocalStorage('socketId');
  //   const toUserDetails = this.getItemFromLocalStorage('selectedUser');
  //   if (toUserDetails && fromUserSocketId && this.fromUser != null || undefined) {
  //     const data = toUserDetails ? JSON.parse(toUserDetails) : null;
  //   }
  // }

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
    this.removeFromLocalStorage();
  }

}
