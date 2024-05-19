import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons'

import {
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonSearchbar,
  IonButtons,
  IonContent, IonHeader, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButtons,
    IonIcon,
    IonInput,
    IonSearchbar,
    IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SearchPage implements OnInit {
  @Output() onClick: EventEmitter<any> = new EventEmitter();
  @Output() search: EventEmitter<any> = new EventEmitter();
  constructor() {
    addIcons({
      'back': arrowBack
    })
   }

  ngOnInit() {
  }
  back() {
    this.onClick.emit(false);
  }
  handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.search.emit(query);
  }

}
