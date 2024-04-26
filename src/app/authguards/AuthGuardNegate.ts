import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './AuthService';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardNegate implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    const user = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (user === null && token === null && localStorage.length === 0) {
      return true
    } else {
      this.router.navigateByUrl('/dashBoard')
      return false
    }
  }
}
