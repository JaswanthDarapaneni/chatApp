import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './authguards/AuthGuard';
import { LoginPage } from './auth/login/login.page';
import { AuthService } from './authguards/AuthService';
import { SocketService } from './socketservice/socket.service';
import { AuthGuardNegate } from './authguards/AuthGuardNegate';

export const routes: Routes = [
  {
    path: 'room',
    canActivate: [AuthGuard],
    loadComponent: () => import('./room/room.page').then((m) => m.RoomPage),
    children: [
      {
        path: 'chatbox',
        canActivate: [AuthGuard],
        loadComponent: () => import('./room/chatbox/chatbox.page').then(m => m.ChatboxPage)
      },
    ]
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
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })

  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }

