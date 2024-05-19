import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonItem, IonAvatar, IonLabel } from '@ionic/angular/standalone';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [IonItem, IonAvatar, IonLabel]
})
export class UserListComponent implements OnInit {
  @Input() item: any;
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() { }
  redirect() {
    this.onClick.emit(this.item);
  }

}
