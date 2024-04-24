import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/authguards/AuthService';
import { AuthGuard } from 'src/app/authguards/AuthGuard';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from 'src/app/socketservice/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth.globle.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [AuthService, SocketService, AuthGuard],
  // encapsulation: ViewEncapsulation.None  this very imp to use the presentToast(), the custom styles will apply only if it sen none.
  encapsulation: ViewEncapsulation.None
})
export class LoginPage implements OnInit {

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }
  credentials!: FormGroup;
  numberPattern = /^\d{10}$/;
  responce: any;

  ngOnInit() {
    this.credentials = this.fb.group({
      // number: ['', {
      //   validators: [Validators.required, Validators.pattern(this.numberPattern)],
      //   updateOn: 'change' 
      // }],
      username: ['', {
        validators: [Validators.required, Validators.minLength(6)],
        updateOn: 'change'
      }],
      password: ['', {
        validators: [Validators.required, Validators.minLength(6)],
        updateOn: 'change'
      }]

    });
  }
  login() {
    setTimeout(async () => {
      if (this.credentials.valid) {
        const loading: HTMLIonLoadingElement = await this.authService.presentLoading();
        const responce = this.authService.login(this.credentials.value.username, this.credentials.value.password);
        responce.then(async (value) => {
          if (value.token) {
            this.responce = 'Login Successful ....';
            this.authService.dismissLoading(loading);
            this.credentials.reset();
            this.authorizeUser();
          } else if (value.status === 404) {
            this.responce = 'User not found';
            this.credentials.reset();
            this.credentials.markAllAsTouched();
          } else if (value.status === 401) {
            this.responce = 'Invalid password';
            this.credentials.get('password')?.setValue('');
            this.credentials.get('password')?.markAsTouched;
          } else {
            this.responce = 'Failed to login'
          }
          setTimeout(async () => {
            if (this.responce != null) {
              await this.authService.presentToast(this.responce);
              this.authService.dismissLoading(loading);
            }
          }, 2000)
        })
      }
    }, 1000);
  }

  private authorizeUser() {
    this.router.navigateByUrl('/room');
  }
  navigateToUrl(){
    this.router.navigateByUrl('/register');
  }
  get username() {
    return this.credentials.get('username')?.value;
  }
}
