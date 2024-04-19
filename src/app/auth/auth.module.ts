import { NgModule } from "@angular/core";
import { AuthService } from "../authguards/AuthService";
import { SocketService } from "../socketservice/socket.service";
import { HttpClientModule } from "@angular/common/http";
import { AuthGuard } from "../authguards/AuthGuard";

@NgModule({
    declarations: [],
    imports: [HttpClientModule],
    providers: [SocketService, AuthService,AuthGuard]
})
export class AuthModule {

}