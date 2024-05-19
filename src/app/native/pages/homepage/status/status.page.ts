import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons'
import {
  ModalController,
  IonModal,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonInput,
  IonList,
  IonButton,
  IonButtons,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonItem,
  NavController
} from '@ionic/angular/standalone';
import { camera, createOutline, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import { CameraComponent } from 'src/app/native/components/status/camera/camera.component';
import { StatusComponent } from 'src/app/native/components/status/status/status.component';
import { NoteComponent } from 'src/app/native/components/status/note/note.component';

@Component({
  selector: 'app-status',
  templateUrl: './status.page.html',
  styleUrls: ['./status.page.scss'],
  standalone: true,
  imports: [
    //components
    StatusComponent,
    CameraComponent,
    NoteComponent,
    //imports
    IonFab,
    IonFabButton,
    IonButtons,
    IonIcon,
    IonFabList,
    IonInput,
    IonModal,
    IonList,
    IonButton,
    IonItemDivider,
    IonLabel,
    IonItem,
    IonItemGroup,
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class StatusPage implements OnInit {
  @ViewChild('new_image_status_modal') modal!: ModalController;
  @ViewChild('new_text_status_modal') textModal!: ModalController;

  users = [
    { id: 1, name: 'NIkhil', photo: 'https://i.pravatar.cc/315' },
    { id: 2, name: 'XYZ', photo: 'https://i.pravatar.cc/325' },
  ];
  add_new_status = false;
  new_text_status = false;
  constructor(
    private navCtrl: NavController
  ) {
    addIcons({
      'note': createOutline,
      'cemara': camera,
      'ellipsis-horizontal': ellipsisHorizontal,
      'ellipsis-vertical': ellipsisVertical
    })
  }

  ngOnInit() {
    console.log('initiating')
  }

  handileNote() {
   
    // this.new_text_status = true;
    this.navCtrl.navigateForward('/home/text')

  }
  handileCamera() {
    this.add_new_status = true;
  }

  onWillDismiss(event: any) {

  }

  cancel() {
    if (this.add_new_status) {
      this.modal.dismiss();
      this.add_new_status = false;
    } else {

      // this.textModal.dismiss();
      // this.new_text_status = false;
    }

  }

}
