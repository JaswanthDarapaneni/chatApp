import { NgModule } from "@angular/core";
import {  IonicModule } from "@ionic/angular";
import {  IonicRouteStrategy } from "@ionic/angular/common";
import { SocketIoModule } from "ngx-socket-io";
import { AppComponent } from "./app.component";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app.routes";
import { RouteReuseStrategy } from "@angular/router";
import { AuthGuard } from "./authguards/AuthGuard";
import { AuthService } from "./authguards/AuthService";
import { HttpClientModule } from "@angular/common/http";


@NgModule({
    declarations: [ AppComponent],
    imports: [BrowserModule,
        IonicModule.forRoot({scrollPadding: false, scrollAssist: false }),
        SocketIoModule.forRoot({url:'http://localhost:3001',options: {autoConnect:false,}}),
        AppRoutingModule,
        HttpClientModule
    ],

    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },AuthGuard],
    bootstrap: [AppComponent],
})

export class AppModule {

} 