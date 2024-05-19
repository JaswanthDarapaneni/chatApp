import { Routes } from '@angular/router';
import { MobchatPage } from '../mobchat/mobchat.page';

export const roomRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./room.page').then((m) => m.RoomPage),
    children: [
      {
        path: 'chat',
        loadChildren: () =>
          import('../mobchat/mobchat.page').then((m) => m.MobchatPage)
      }
    ]
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

