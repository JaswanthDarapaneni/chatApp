import { Routes } from '@angular/router';
import { AuthGuard } from './authguards/AuthGuard';
import { LoginPage } from './auth/login/login.page';
import { AuthGuardNegate } from './authguards/AuthGuardNegate';

export const MainRoutes: Routes = [
  // {
  //   path: 'dashBoard',
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import('./dashboard/room/room.routes').then((m) => m.roomRoutes)
  // },
  {
    path: '',
    redirectTo: 'home',
    // redirectTo: 'dashBoard',
    pathMatch: 'full'
  },

  {
    path: 'home',
    loadChildren: () => import('./native/pages/homepage/home.routes').then((m) => m.HomeRoutes)
  },

  {
    path: 'login',
    canActivate: [AuthGuardNegate],
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
  },

  {
    path: 'register',
    canActivate: [AuthGuardNegate],
    loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage)
  },

  {
    path: 'verifyuser',
    canActivate: [AuthGuardNegate],
    loadComponent: () => import('./auth/verifyuser/verifyuser.page').then(m => m.VerifyuserPage)
  },

  {
    path: '',
    canActivate: [AuthGuardNegate],
    component: LoginPage,
    pathMatch: 'full'
  },


];


