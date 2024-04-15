import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['../auth.globle.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class RegisterPage implements OnInit {
  credentials!: FormGroup;
 numberPattern = /^\d{10}$/;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      fullname: ['',[Validators.required]],
      email:['', [Validators.required, Validators.email]],
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
  register(){

  }

}
