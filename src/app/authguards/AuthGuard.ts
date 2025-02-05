import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './AuthService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  async canActivate(): Promise<boolean> {
    if (await this.authService.isLoggedIn()) {
      // this.router.navigateByUrl('/dashBoard', { skipLocationChange: true })
      return true
    } else {
      return false
    }
  }
}