import { Component, OnInit } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { IonAccordion, IonButton, PickerOptions, IonContent, IonTextarea, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ColorPickerModule, IonButton, IonContent, IonTextarea, IonItem, IonLabel, IonSelect, IonSelectOption]
})
export class NoteComponent implements OnInit {
  Toggle = false
  constructor() { }

  ngOnInit() { }

  textInput: string = '';
  selectedFont: string = 'Arial';
  selectedColor: string = '#000000';

  applyStyles() {
    // Apply styles logic here
  }
  openToggle() {
    this.Toggle = true
  }

}
