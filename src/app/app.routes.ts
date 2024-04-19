import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './authguards/AuthGuard';

export const routes: Routes = [
  {
    path: 'room',
    canActivate: [AuthGuard],
    loadComponent: () => import('./room/room.page').then((m) => m.RoomPage),
    children: [
      // {
      //   path: 'searchbar',
      //   loadComponent: () => import('./room/searchbar/searchbar.page').then( m => m.SearchbarPage)
      // },
      // {
      //   path: 'header',
      //   loadComponent: () => import('./room/header/header.page').then( m => m.HeaderPage)
      // },
      // {
      //   path: 'users',
      //   canActivate: [AuthGuard],
      //   loadComponent: () => import('./room/users/users.page').then( m => m.UsersPage)
      // },
      {
        path: 'chatbox',
        canActivate: [AuthGuard],
        loadComponent: () => import('./room/chatbox/chatbox.page').then( m => m.ChatboxPage)
      },
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.page').then( m => m.RegisterPage)
  },

  {
    path: 'verifyuser',
    loadComponent: () => import('./auth/verifyuser/verifyuser.page').then( m => m.VerifyuserPage)
  },
  
  
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })

  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

