import { Component } from '@angular/core';
import { IonRouterOutlet, IonApp, IonContent } from '@ionic/angular/standalone';
import { OnlineOfflineService } from './internetService/online-offline.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonContent, IonApp, IonRouterOutlet, ],
  providers: []
})
export class AppComponent {
  constructor() {};
}
