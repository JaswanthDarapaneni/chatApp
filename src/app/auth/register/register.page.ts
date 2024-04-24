import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/authguards/AuthService';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from 'src/app/authguards/AuthGuard';
import { SocketService } from 'src/app/socketservice/socket.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../auth.globle.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [AuthService, SocketService, AuthGuard],
})
export class RegisterPage implements OnInit {
  credentials!: FormGroup;
  numberPattern = /^\d{10}$/;
  responce: any;
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      number: ['', {
        validators: [Validators.required, Validators.pattern(this.numberPattern)],
        updateOn: 'change'
      }],
      password: ['', {
        validators: [Validators.required, Validators.minLength(6)],
        updateOn: 'change'
      }]

    });
  }
  register() {
    if (this.credentials.valid) {
      setTimeout(async () => {
        const loading: HTMLIonLoadingElement = await this.authService.presentLoading();
        this.authService.userRegister(this.credentials.value)
          .then((response: any) => {
            if (response.email) {
              setTimeout(async () => {
                await this.authService.presentToast(response.email);
              }, 2000)
              this.authService.dismissLoading(loading);
              this.verifyUser();
            }
          })
          .catch((error: any) => {
            if (error.status === 400 && error.error && error.error.error) {
              const errorMessage = error.error.error;
              if (errorMessage.includes('email') || errorMessage.includes('username') || errorMessage.includes('number')) {
                if (errorMessage.includes('email')) {
                  this.responce = 'Email is Exited';
                  this.credentials.get('email')?.setValue('');
                  this.credentials.get('email')?.markAsTouched;
                }
                if (errorMessage.includes('number')) {
                  this.responce = 'Number is Exited';
                  this.credentials.get('number')?.setValue('');
                  this.credentials.get('number')?.markAsTouched;
                }
                if (errorMessage.includes('username')) {
                  this.responce = 'Username is Taken';
                  this.credentials.get('username')?.setValue('');
                  this.credentials.get('username')?.markAsTouched;
                }
                setTimeout(async () => {
                  if (this.responce != null) {
                    await this.authService.presentToast(errorMessage);
                  }
                  this.authService.dismissLoading(loading);
                }, 3000)
              }
            } else {
              console.error('Unexpected error:', error);
              // Handle other types of errors
            }
          });
      }, 1000)
    }
  }
  verifyUser() {
    this.credentials.reset();
    this.router.navigateByUrl('/verifyuser')
  }

}
