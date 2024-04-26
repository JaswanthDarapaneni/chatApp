import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { PreloadAllModules, PreloadingStrategy, RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { MainRoutes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule, Storage, provideStorage } from '@ionic/storage-angular';
if (environment.production) {
  enableProdMode();
}

const socketIoConfig: SocketIoConfig = {
  url: 'http://localhost:3001',
  options: { autoConnect: false }
};


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      scrollPadding: false,
      scrollAssist: false
    }),
    provideRouter(MainRoutes,withPreloading(PreloadAllModules),withComponentInputBinding()),
    provideHttpClient(),
    { provide: Socket, useFactory: () => new Socket(socketIoConfig) },
    { provide: Storage, useFactory: () => new Storage({ name: '__mydb', description: 'conversation data storing', driverOrder: [ Drivers.IndexedDB, Drivers.LocalStorage] }) }
  ]
});
