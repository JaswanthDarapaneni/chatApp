import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { addIcons } from 'ionicons'
import {
  IonContent,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  IonTabBar,
  IonList,
  IonListHeader,
  IonItem,
  IonAvatar,
  IonText,
  IonFab,
  IonModal,
  IonPopover,
  IonButton,
  IonIcon,
  IonButtons,
  IonFabButton,
  IonFooter,
  IonInput,
  IonHeader, IonTitle, IonToolbar, IonRouterOutlet, ModalController, PopoverController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserListComponent } from '../../components/user/user-list/user-list.component';
import { add, apertureOutline, callOutline, cameraOutline, chatbubblesOutline, ellipsisVerticalCircleOutline, search } from 'ionicons/icons';
import { PhonePage } from './phone/phone.page';
import { StatusPage } from './status/status.page';
import { SearchPage } from './search/search.page';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.page.html',
  styleUrls: ['./homepage.page.scss'],
  standalone: true,
  imports: [
    // components
    UserListComponent,
    // pages
    PhonePage,
    StatusPage,
    SearchPage,
    // imports
    IonSegment,
    IonButtons,
    IonFabButton,
    IonInput,
    IonLabel,
    IonSegmentButton,
    IonTabBar,
    IonList,
    IonListHeader,
    IonItem,
    IonAvatar,
    IonText,
    IonFab,
    IonModal,
    IonPopover,
    IonButton,
    IonIcon,
    IonFooter,

    IonRouterOutlet, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomepagePage implements OnInit, AfterViewInit {
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  @ViewChild('new_chat') modal!: ModalController;
  @ViewChild('popover') popover!: PopoverController;
  
  segment = 'chats';
  title = 'chitChat'
  open_new_chat = false;
  users = [
    { id: 1, name: 'NIkhil', photo: 'https://i.pravatar.cc/315' },
    { id: 2, name: 'XYZ', photo: 'https://i.pravatar.cc/325' },
  ];
  chatRooms = [
    { id: 1, name: 'NIkhil', photo: 'https://i.pravatar.cc/315' },
    { id: 2, name: 'XYZ', photo: 'https://i.pravatar.cc/325' },
    { id: 1, name: 'NIkhil', photo: 'https://i.pravatar.cc/315' }
  ];
  constructor(
    private router: Router
  ) {
    addIcons({
      'chat': chatbubblesOutline,
      'status': apertureOutline,
      'calls': callOutline,
      'add': add,
      'search': search,
      'camera': cameraOutline,
      'logout': ellipsisVerticalCircleOutline

    })
  }
  ngAfterViewInit(): void {
    register();

  }

  ngOnInit() {
  }
  showSearch: boolean = false;

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }
  clearSearch(event: any) {
    console.log(event)
    this.showSearch = false;
  }
  searchData(event: any) {
    console.log(event)
  }


  logout() {
    this.popover.dismiss();
  }

  newChat() {
    this.open_new_chat = true;
  }

  onWillDismiss(event: any) { }

  cancel() {
    this.modal.dismiss();
    this.open_new_chat = false;
  }

  startChat(item: any) {

  }

  getChat(item: any) {
    this.router.navigate(['/', 'home', 'chat']);
  }

  onSegmentChanged(event: any) {
    this.segment = event.detail.value;
    this.slideToSegment()

  }
  onSlideChange() {
    switch (this.swiperRef?.nativeElement.swiper.activeIndex) {
      case 0:
        // Chats slide
        this.segment = 'chats';
        this.title = 'chitChat'
        break;
      case 1:
        // Status slide
        this.segment = 'status';
        this.title = 'Status'
        break;
      case 2:
        // Calls slide
        this.segment = 'calls';
        this.title = 'Calls'
        break;
      default:
        break;
    }
  }

  slideToSegment() {
    switch (this.segment) {
      case 'chats':
        this.swiperRef?.nativeElement.swiper.slideTo(0);
        break;
      case 'status':
        this.swiperRef?.nativeElement.swiper.slideTo(1);
        break;
      case 'calls':
        this.swiperRef?.nativeElement.swiper.slideTo(2);
        break;
      default:
        break;
    }
  }
}
