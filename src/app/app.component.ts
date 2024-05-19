import { Component } from '@angular/core';
import { IonRouterOutlet, IonApp, IonContent } from '@ionic/angular/standalone';

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
