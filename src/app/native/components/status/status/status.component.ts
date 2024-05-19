import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonIcon, IonFabButton, IonTextarea, IonFooter, IonList, IonContent, IonSpinner, IonInput, IonButton, IonButtons, IonToolbar, IonHeader, IonModal, IonItem, IonAvatar, IonLabel, ModalController } from '@ionic/angular/standalone'
import { WatchstatusComponent } from './watchstatus/watchstatus.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-com-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  standalone: true,
  imports: [
    // Components
    WatchstatusComponent,
    // Modules
    CommonModule,
    // Imports
    FormsModule, IonIcon, IonFabButton, IonTextarea, IonFooter, IonSpinner, IonList, IonContent, IonButton, IonButtons, IonToolbar, IonHeader, IonModal, IonItem, IonAvatar, IonLabel, IonInput]
})
export class StatusComponent implements OnInit {
  @Input() item!: any;
  @Input() user!: any;
  @ViewChild('new_view_status') view_modal!: ModalController;
  view_new_status = false;
  data: any = true;
  protected message = ''
  protected isLoading = false
  statusInfo = [
    { text: 'hello there im jaswanth', type: 'text', duration: 10000, background_colour: 'blue', text_colour: 'white' },
    { text: 'hello', type: 'video', duration: 15000 },
    { text: 'hi', type: 'text', duration: 10000 },
  ]
  constructor(
  ) { }

  ngOnInit() { }
  redirect(item: any) {
    this.view_new_status = true;
    this.data = this.statusInfo;
    this.user = item;
  }
  cancel() {
    this.view_new_status = false
  }
  onWillDismiss(event: any) {

  }
  sendMessage() {

  }

}
