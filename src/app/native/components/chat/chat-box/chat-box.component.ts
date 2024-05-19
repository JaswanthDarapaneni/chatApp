import { Component, Input, OnInit } from '@angular/core';
import { addIcons } from 'ionicons'
import { IonItem, IonLabel, IonNote, IonText, IonIcon } from '@ionic/angular/standalone'
import { checkmarkDone, checkmarkDoneOutline, checkmarkOutline, timerOutline } from 'ionicons/icons';
@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonNote, IonText, IonIcon]
})
export class ChatBoxComponent implements OnInit {

  @Input() chat: any;
  @Input() current_user_id: any;
  constructor() {
    addIcons({
      'pending-icon': timerOutline,
      'checkmark-outline': checkmarkOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'arrow-forward-outline': checkmarkDone
    })
  }
  ngOnInit() { }

}
