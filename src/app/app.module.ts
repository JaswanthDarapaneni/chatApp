import { NgModule } from "@angular/core";
import { IonApp, IonicModule } from "@ionic/angular";
import { IonRouterOutlet, IonicRouteStrategy } from "@ionic/angular/common";
import { ChatPage } from "./chat/chat.page";
import { SocketIoModule } from "ngx-socket-io";
import { AppComponent } from "./app.component";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app.routes";
import { RouteReuseStrategy } from "@angular/router";


@NgModule({
    declarations: [ AppComponent],
    imports: [BrowserModule,
        IonicModule.forRoot({scrollPadding: false, scrollAssist: false }),
        SocketIoModule.forRoot({url:'http://localhost:3000',options: {autoConnect:false}}),
        AppRoutingModule,
       
    ],

    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
    bootstrap: [AppComponent],
})

export class AppModule {

} 