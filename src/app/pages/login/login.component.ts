import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/AuthService/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  private authService=inject(AuthService);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      google.accounts.id.initialize({
        client_id: '612384949369-68s3mfabu5gbibvr1ujq1echrqnk8hih.apps.googleusercontent.com',
        callback: (response: any) => {
          console.log("Respuesta:", response);
          this.authService.signIn(response);
        }
      });

      google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: 'filled_blue',
          size: 'large',

        }
      );
    }
  }


}
