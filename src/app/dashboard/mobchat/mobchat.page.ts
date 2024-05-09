import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mobchat',
  templateUrl: './mobchat.page.html',
  styleUrls: ['./mobchat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton]
})
export class MobchatPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  call(message: any) {
    console.log(message)
  }

}
