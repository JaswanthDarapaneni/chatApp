import { Injectable } from "@angular/core";
import { SocketService } from "../socketservice/socket.service";
import { LoadingController, ToastController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment"
import { RoomService } from "../dashboard/room/room.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private uri = environment.URI;

    constructor(private roomservice: RoomService, private http: HttpClient, private socketService: SocketService, private loading: LoadingController, private toastController: ToastController) { }

    async isLoggedIn(): Promise<boolean> {
        const user = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        if (user != null) {
            if (token != null) {
                if (await this.validateUserLogin()) {
                    return true
                }
                return false;
            }
            return false;
        }
        return false;
    }

    async validateUserLogin(): Promise<boolean> {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        this.http.get(`${this.uri}/auth/verifyToken`, { headers }).subscribe((r: any) => {
            if (r.userId) {
                localStorage.setItem('userId', r.userId)
            }
        })
        return true;
    }

    async userRegister(data: any): Promise<any> {
        try {
            const response = await this.http.post<any>(`${this.uri}/auth/register`, data).toPromise();
            return response;
        } catch (error) {
            throw error; // Rethrow the error to propagate it back to the calling component
        }
    }

    async login(username: string, password: String): Promise<any> {
        try {
            const response = await this.http.post<any>(`${this.uri}/auth/login`, { username, password }).toPromise();
            localStorage.setItem('token', response.token);
            localStorage.setItem('username', username);
            // const status = await this.roomservice.loadConversation();
            // if (status) {
                return response;
            // }
  
        } catch (error: any) {
            return error;
        }
    }


    async verifyUser(otp: any): Promise<any> {
        try {
            const responce = await this.http.post<any>(`${this.uri}/auth/verify-email`, { token: otp }).toPromise();
            return responce;
        } catch (error: any) {
            return error;
        }
    }

    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 3000,
            position: 'top',
            cssClass: 'custom-toast'
        });
        toast.present();
    }

    async presentLoading() {
        const loading = await this.loading.create({
            message: 'Loading...',
            duration: 30000, // Duration in milliseconds
            spinner: 'dots', // Spinner type
        });
        await loading.present();

        return loading;
    }
    async dismissLoading(loading: HTMLIonLoadingElement) {
        await loading.dismiss();
    }
}
