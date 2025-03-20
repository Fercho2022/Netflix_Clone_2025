import { Component, inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { GoogleUserData } from '../../../interfaces/GoogleUserData/GoogleUserData';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit{
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  @Input({ required: true }) userImg: string = '';

  // Añade esta propiedad
  userName: string = '';

  navList: string[] = [
    'Inicio',
    'Series',
    'Peliculas',
    'Novedades populares',
    'Mi Lista',
    'Explora por',
  ];

  isDropdownOpen = false;
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}') as GoogleUserData;
      this.userName = userData.name || userData.given_name || 'Usuario';
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateTo(item: string) {
    if (item === 'Mi Lista') {
      this.router.navigate(['/my-list']);
    } else if (item === 'Inicio') {
      this.router.navigate(['/browse']);
    }
    // Puedes agregar más navegaciones para otros ítems
  }
  logout() {
    // Aquí implementas la lógica de logout
    console.log('Iniciando cierre de sesión...');
    this.authService.signOut();
    this.isDropdownOpen = false;
  }
}
