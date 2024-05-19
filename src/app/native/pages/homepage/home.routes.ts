import { Router, Routes } from "@angular/router";
import { HomepagePage } from "./homepage.page";

export const HomeRoutes: Routes = [

    {
        path: '',
        component: HomepagePage,
    },
    {
        path: 'chat',
        loadComponent: () => import('./chat/chat.page').then((m) => m.ChatPage)
    },
    {
        path: 'text',
        loadComponent: () => import('./status/text/text.page').then((m) => m.TextPage)
    }
]