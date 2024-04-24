import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SocketService } from 'src/app/socketservice/socket.service';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.page.html',
  styleUrls: ['./searchbar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SearchbarPage implements OnInit {
  public results: any = [];
  @Output() userSelected: EventEmitter<any> = new EventEmitter<any>();
  constructor(private service: SocketService, private navCtrl: NavController) { }

  ngOnInit() {
  }

  handleInput(search: any) {
    const query = search.target.value;
    this.service.onSearch(query).subscribe((e) => {
      if (e.users != null) {
        return this.results = e.users;
      }
      this.results = null;
    })
  }
  sendDataToUserPage(user: any) {
    this.userSelected.emit(user);
    this.results = null;
  }

}
