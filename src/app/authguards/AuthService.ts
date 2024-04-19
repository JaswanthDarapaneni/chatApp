import { Injectable } from "@angular/core";
import { SocketService } from "../socketservice/socket.service";
import { LoadingController, ToastController } from "@ionic/angular";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private uri = "http://localhost:3001/api"
    constructor(private http: HttpClient, private socketService: SocketService, private loading: LoadingController, private toastController: ToastController) { }
    isLoggedIn() {
        const user = localStorage.getItem('username');
        if (user) {
            return true;
        }
        return false;
    }

    async userRegister(data: any): Promise<any> {
        try {
            const response = await this.http.post<any>(`${this.uri}/user/register`, data).toPromise();
            return response;
        } catch (error) {
            throw error; // Rethrow the error to propagate it back to the calling component
        }
    }

    async login(username: string, password: String): Promise<any> {
        try {
            const response = await this.http.post<any>(this.uri + '/user/login', { username, password }).toPromise();
            localStorage.setItem('token', response.token);
            localStorage.setItem('username', username);
            this.socketService.socketLogin(username);
            return response;
        } catch (error: any) {
            return error;
        }

    }


    async verifyUser(otp: any): Promise<any> {
        try {
            const responce = await this.http.post<any>(this.uri + '/user/verify-email', { token: otp }).toPromise();
            return responce;
        } catch (error:any) {
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
