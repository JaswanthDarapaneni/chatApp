import { Routes } from '@angular/router';

export const roomRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./room.page').then((m) => m.RoomPage),
  },
  {
    path: 'chatbox',
    loadComponent: () =>
      import('../chatbox/chatbox.page').then((m) => m.ChatboxPage),
  },
  {
    path: 'mobchatbox',
    loadComponent: () =>
      import('../mobchat/mobchat.page').then((m) => m.MobchatPage),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
  