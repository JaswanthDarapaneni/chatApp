import { Injectable } from "@angular/core";
import { SocketService } from "../socketservice/socket.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private socketService: SocketService) { }
        isLoggedIn() {
        const user = localStorage.getItem('username');
        if (user) {
        this.socketService.login(user);
            return true;
        }
        return false;
    }
}
