declare var google: any;

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private router: Router) {}

  signIn(response: any) {
    const payload = this.decodeToken(response.credential);
    sessionStorage.setItem('loggedInUser', JSON.stringify(payload));
    this.router.navigate(['browse']);
  }

  signOut() {
    google.accounts.id.disableAutoSelect();
    //google.accounts.id.revoke();  // Agrega esta línea
    // sessionStorage.clear();  // Mejor que removeItem
   // sessionStorage.removeItem('loggedInUser');
   google.accounts.id.revoke('', () => {
    sessionStorage.clear();
    google.accounts.id.initialize({
      client_id: '612384949369-68s3mfabu5gbibvr1ujq1echrqnk8hih.apps.googleusercontent.com',
      callback: (response: any) => {
        console.log("Respuesta:", response);
        this.signIn(response);
      }
    });
    this.router.navigate(['']);
  });
  }

  private decodeToken(token: string) {
    // 1. token.split(".")[1] - Obtiene la parte payload del JWT
    // 2. atob() - Decodifica de base64 a texto
    // 3. JSON.parse() - Convierte el string JSON a objeto
    return JSON.parse(atob(token.split('.')[1]));
  }
}
