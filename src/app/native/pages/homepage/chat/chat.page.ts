import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBoxComponent } from 'src/app/native/components/chat/chat-box/chat-box.component';
import { addIcons } from 'ionicons';
import {
  IonBackButton,
  IonList,
  IonItemGroup,
  IonFooter,
  IonTextarea,
  IonButtons,
  IonFabButton,
  IonSpinner,
  IonIcon,
  IonContent, IonHeader, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { happyOutline, happySharp, send } from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    //components
    ChatBoxComponent,
    //ionStatndalone
    IonBackButton,
    IonIcon,
    IonList,
    IonItemGroup,
    IonFooter,
    IonTextarea,
    IonButtons,
    IonFabButton,
    IonSpinner,
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ChatPage implements OnInit {

  constructor() {
    addIcons({
      'happy-outline': happySharp,
      'send': send
    })
  }

  ngOnInit() {
  }

  name: string = 'Sender';
  message!: string;
  isLoading = false;
  currentUserId = 1;
  chats = [
    { id: 1, sender: 1, message: 'hi' },
    { id: 2, sender: 2, message: 'hi there!' },
  ];

  sendMessage() {
    this.chats.push({ id: 1, sender: 1, message: 'hi' })
  }

}
