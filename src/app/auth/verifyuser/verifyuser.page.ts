import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthModule } from '../auth.module';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/authguards/AuthService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verifyuser',
  templateUrl: './verifyuser.page.html',
  styleUrls: ['../auth.globle.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [IonicModule, AuthModule, CommonModule, FormsModule]
})
export class VerifyuserPage {
  verificationCode!: string;
  validationError!: string;

  constructor(private authService: AuthService, private router: Router) { }
  verifyUser() {
    // Validate the verification code
    if (!this.verificationCode || this.verificationCode.length !== 6 || !/^\d+$/.test(this.verificationCode)) {
      this.validationError = 'Please enter a valid 6-digit verification code.';
      return;
    }
    const responce = this.authService.verifyUser(parseInt(this.verificationCode))
    responce.then(async (e) => {
      const loading: HTMLIonLoadingElement = await this.authService.presentLoading();
      if (e.status === 401) {
        setTimeout(() => {
          this.authService.dismissLoading(loading)
          this.authService.presentToast(e.error.error)
        }, 2000)
      } else {
        this.authService.dismissLoading(loading)
        this.router.navigateByUrl("/login");
        this.authService.presentToast(e.message)
      }
    })
  }

}
