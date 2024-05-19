import { CommonModule, } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { IonSegment, IonProgressBar, IonButtons, IonIcon, IonButton } from '@ionic/angular/standalone';
import Swiper from 'swiper';
import { register } from 'swiper/element/bundle';
import { LongPressDirective } from '../../../directives/longpress.directive';
import { addIcons } from 'ionicons';
import { arrowBack, happySharp, send } from 'ionicons/icons';

@Component({
  selector: 'app-watchstatus',
  templateUrl: './watchstatus.component.html',
  styleUrls: ['./watchstatus.component.scss'],
  standalone: true,
  imports: [
    IonSegment,
    CommonModule,
    IonProgressBar,
    LongPressDirective,
    IonButtons, IonIcon, IonButton
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WatchstatusComponent implements OnInit, AfterViewInit {

  @ViewChild('swiper', { static: false }) swiperRef!: ElementRef;
  @Output() back: EventEmitter<any> = new EventEmitter<any>();
  @Input() data!: any;
  @Input() user!: any;
  swiper?: Swiper;

  private pauseData: { paused: boolean, progress: number } = { paused: false, progress: 0 };
  private canSlide = false;
  private progressBarInterval: any;
  private direction?: any;
  // Accecing in view
  protected progress = 0;
  protected activeSwiperIndex: number = 0;
  protected duration?: number;
  protected headerShow = true;
  protected ShowButtons = false;

  constructor() {
    addIcons({
      'arrow-back': arrowBack,
      'happy': happySharp,
      'send': send
    })
  }

  ngOnInit() {
    this.duration = this.data[0]?.duration;
  }

  ngAfterViewInit(): void {
    register()
  }
  close() {
    this.back.emit()
  }

  sendMessage() {

  }

  showFooter() {
    this.ShowButtons = true;
    const swiperInstance = this.swiperRef.nativeElement.swiper;
    swiperInstance.autoplay.stop();
    this.pauseData = {
      paused: true,
      progress: this.progress
    };
    this.pauseProgressBar();
  }

  // Initiating the swiper
  swiperInit(event: any) {
    const swiperInstance = event.detail[0];
    if (swiperInstance && !swiperInstance?.destroyed && swiperInstance?.activeIndex !== undefined) {
      const activeIndex = swiperInstance.activeIndex;
      this.startProgressBar(activeIndex);
    }
  }

  // When single touch start
  onTouchStart(event: any) {

    if (event.detail[0].activeIndex === 0) {
      this.pauseData = {
        paused: true,
        progress: this.progress
      };

      this.pauseProgressBar();

      const swiperInstance = this.swiperRef.nativeElement.swiper;
      swiperInstance.autoplay.start();
      setTimeout(() => {
        this.startProgressBar(event.detail[0].activeIndex);
        swiperInstance.autoplay.stop();
      }, 500);

    }

    this.canSlide = true;
    // Save the direction for later use
    this.direction = event.detail[1].clientX < window.innerWidth / 2;
    const swiperInstance = this.swiperRef.nativeElement.swiper;
    // If it's the end, implement close logic
    if (event.detail[0].isEnd) {
      swiperInstance.autoplay.stop();
    }
  }

  // To  handile the long press
  onLongPress() {
    this.canSlide = false;
    this.headerShow = false;
    this.pauseData = {
      paused: true,
      progress: this.progress
    };
    this.pauseProgressBar();
    const swiperInstance = this.swiperRef.nativeElement.swiper;
    swiperInstance.autoplay.stop();

  }
  // After the longPress End or single touch end this will trigger
  touchEnd(event: any) {

    if (this.ShowButtons) {
      this.ShowButtons = false;
      this.callUpdateProgress(this.duration)

    } else {

      this.headerShow = true;
      const swiperInstance = this.swiperRef.nativeElement.swiper;

      if (event.detail[0].isEnd) {
        swiperInstance.autoplay.stop();
        if (this.canSlide) {
          this.close();
        }
      } else if (event.detail[0].isBeginning) {
        this.callUpdateProgress(this.duration);
      } else {
        swiperInstance.autoplay.start();
      }

      // Check if paused, if paused then resume from saved progress
      if (this.pauseData.paused && this.duration) {
        this.callUpdateProgress(this.duration)
      }

      if (this.canSlide) {
        if (this.direction) {
          let prevIndex = this.swiperRef?.nativeElement.swiper.activeIndex - 1;
          this.slideBefore(prevIndex);
        } else {
          this.slideNext();
        }
      }
    }

  }

  private callUpdateProgress(duration: any) {
    this.progress = this.pauseData.progress;
    this.updateProgressBar(this.pauseData.progress, this.activeSwiperIndex, duration);
    this.pauseData = { paused: false, progress: 0 }; // Clear pause data
  }

  // When ever slide change autoplay will call
  swiperslidechange(event: any) {
    this.startProgressBar(event.detail[0].activeIndex)
  }

  // Swiper properties to slide next
  private slideNext() {
    this.swiperRef?.nativeElement.swiper.slideNext();
  }

  // Swiper properties to slide before
  private slideBefore(index: any) {
    clearInterval(this.progressBarInterval);
    this.swiperRef?.nativeElement.swiper.slideTo(index)
  }

  // Startung progressbar
  private startProgressBar(activeIndex: any) {

    if (this.data && this.data[activeIndex] && this.data[activeIndex].duration !== undefined) {
      const duration = this.data[activeIndex]?.duration;
      this.updateProgressBar(0, activeIndex, duration);
    }
  }


  // Initiating and Updating progressbar
  private updateProgressBar(startProgress: number = 0, activeIndex: number, ActuvalDuration: number) {
    this.activeSwiperIndex = activeIndex;
    this.duration = ActuvalDuration;
    const interval = 10;
    this.progress = startProgress;
    const iterations = ActuvalDuration / interval;
    const increment = 1 / iterations;
    clearInterval(this.progressBarInterval);
    this.progressBarInterval = setInterval(() => {
      this.progress += increment;
    }, interval);
  }

  // This pause the progressbar 
  private pauseProgressBar() {
    clearInterval(this.progressBarInterval); // Clear the interval to pause the progress bar
  }

}
