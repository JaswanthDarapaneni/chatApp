import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonFooter,PopoverController, IonLabel, IonItem, IonIcon, IonSelectOption, IonSelect, IonPopover, IonButton, IonTextarea, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ColorPickerModule } from 'ngx-color-picker';
import { addIcons } from 'ionicons';
import { colorPaletteOutline, ellipseOutline, shareOutline, textOutline } from 'ionicons/icons';
@Component({
  selector: 'app-text',
  templateUrl: './text.page.html',
  styleUrls: ['./text.page.scss'],
  standalone: true,
  imports: [IonFooter,IonLabel, IonItem, IonIcon, ColorPickerModule, IonSelectOption, IonSelect, IonPopover, IonTextarea, IonButtons, IonButton, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TextPage implements OnInit {
  @ViewChild('popover_font') popoverFont!: PopoverController;
  @ViewChild('popover') popover!: PopoverController;

  backgroundColors: { name: string; value: string }[] = [
    { name: 'Light Orange', value: '#ffcc80' },
    { name: 'Light Blue', value: '#b2ebf2' },
    { name: 'Light Green', value: '#c5e1a5' },
    { name: 'Light Yellow', value: '#ffe0b2' },
    { name: 'Light Cyan', value: '#b3e5fc' },
    { name: 'Light Salmon', value: '#ffab91' },
    { name: 'Light Aqua', value: '#80deea' },
    { name: 'Light Lime', value: '#e6ee9c' },
    { name: 'Light Peach', value: '#ffccbc' },
    { name: 'Light Turquoise', value: '#b2dfdb' }
  ];

  TextColors: string[] = ['#FF5733', '#FFC300', '#FF33D8', '#33FFEB', '#339CFF', '#B033FF', '#FF338E'];
  Textsizes: number[] = [16, 17, 18, 19, 20, 21, 23, 25, 30, 32, 34, 36];
  fontStyles: string[] = [
    'Arial', 'Verdana', 'Helvetica', 'Tahoma', 'Times New Roman',
    'Georgia', 'Courier New', 'Lucida Console', 'Impact',
    'Comic Sans MS', 'Trebuchet MS', 'Palatino Linotype', 'Book Antiqua', 'Arial Black'
  ];

  backgroundColour: string = '';
  textUpdate: string = '';
  showTextbox: boolean = false;
  textAreaTop: number = 0;
  textAreaLeft: number = 0;
  fontStyle: string = '';
  fontColor: string = '';
  fontSize: string = '';

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    this.getRandomColor();
    addIcons({
      "color-palette-outline": colorPaletteOutline,
      'ellipse-outline': ellipseOutline,
      'text-outline': textOutline,
      'share-outline': shareOutline
    });
  }

  handleContentClick(event: any) {
    if (!event.target.closest('.fullscreen-textarea')) {
      this.getRandomColor();
    }
  }

  onTextChange(text: string): void {
    this.textUpdate = text;
    this.fontSize = this.calculateFontSize(text);
  }

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * this.backgroundColors.length);
    this.backgroundColour = this.backgroundColors[randomIndex].value;
  }
  shareStatus(){
        // share the status
  }

  calculateFontSize(text: string): string {
    let fontSize = '25px'; // Base font size

    const thresholds = [
      { length: 50, size: '25px' },
      { length: 350, size: '23px' }
    ];

    for (const threshold of thresholds) {
      if (text.length > threshold.length) {
        fontSize = threshold.size;
      }
    }

    if (text.length > 450) {
      const extraLength = text.length - 100;
      const newFontSize = Math.max(25 - extraLength * 0.1, 10); // Ensure minimum font size
      fontSize = `${newFontSize}px`;
    }

    return fontSize;
  }

  changeFontStyle(style: string) {
    this.fontStyle = style;
    this.popoverFont.dismiss();
  }

  changeFontColor(color: string) {
    this.fontColor = color;
    this.popover.dismiss();
  }

  showTextArea(event: any) {
    this.showTextbox = true;
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const textAreaHeight = 100; // Adjust as needed
    const textAreaWidth = 300; // Adjust as needed
    this.textAreaTop = (screenHeight - textAreaHeight) / 2;
    this.textAreaLeft = (screenWidth - textAreaWidth) / 2;
  }
}
