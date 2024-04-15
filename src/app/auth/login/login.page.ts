import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/authguards/AuthService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth.globle.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }  
  credentials!: FormGroup;
  numberPattern = /^\d{10}$/;

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
    localStorage.setItem('username', this.username);
    setTimeout(() => {
      this.router.navigateByUrl('/room');
      this.authService.isLoggedIn();
    }, 1000);
  }
  get username(){
    return this.credentials.get('username')?.value;
  }
}
