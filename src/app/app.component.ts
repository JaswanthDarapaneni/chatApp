import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HomePage } from './home/home.page';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { ChatPage } from './chat/chat.page';
import { SocketService } from './socketservice/socket.service';
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  
})
export class AppComponent {
  constructor() {};
}
