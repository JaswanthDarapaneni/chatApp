import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService, User } from '../socketservice/socket.service';
import { SocketIoModule } from 'ngx-socket-io';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SocketIoModule],
})
export class ChatPage implements OnChanges {
  @Input() userSelected: User | null = null;
  selectedUser!: any;
  selectedUserSocketId!: any;
  messages: any[] = [];
  newMessage: string = '';

  constructor(
    private service: SocketService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userSelected) {
      console.log(this.userSelected)
      this.selectedUser = this.userSelected.userId;
      this.selectedUserSocketId = this.userSelected.socketId;
      this.loadConversation();
    }
  }

  isSmallScreen(): boolean {
    return window.innerWidth < 768;
  }

  back(): void {
    this.router.navigateByUrl('/home');
  }

  ngOnInit(): void {
    if (this.isSmallScreen()) {
      this.route.params.subscribe(params => {
        localStorage.setItem('selectedUserId',params['userId']);
        localStorage.setItem('selectedSocketId',params['socketId'])
        this.selectedUser = localStorage.getItem('selectedUserId');
        this.selectedUserSocketId = localStorage.getItem('selectedSocketId');
        this.loadConversation();
      });
    }
  }

  sendMessageToRecipient(message: string) {
    if (this.selectedUser && message.trim()) {
      const username = localStorage.getItem('username');
      if (username) {
        this.service.sendMessage(username, this.selectedUser, message);
        this.messages.push({ from: username, to: this.selectedUser, message });
        this.newMessage = '';
        this.loadConversation();
      }
    }
  }
  private loadConversation(): void {
    const username = localStorage.getItem('username');
    if (username && this.selectedUser) {
      this.service.receiveMessage();
      // this.service.getConversation(username, this.selectedUser.socketId).subscribe(
      //   conversation => {
      //     this.messages = conversation;
      //   },
      //   error => {
      //     console.error('Error loading conversation:', error);
      //     // Handle error appropriately (e.g., display error message to user)
      //   }
      // );
    }
  }
}
