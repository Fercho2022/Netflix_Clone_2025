import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {

  @Input({ required: true }) userImg: string = '';

  constructor(private router: Router) {}

  navList: string[] = [
    'Inicio',
    'Series',
    'Peliculas',
    'Novedades populares',
    'Mi Lista',
    'Explora por',
  ];

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateTo(item: string) {
    if (item === 'Mi Lista') {
      this.router.navigate(['/my-list']);
    }else if (item==='Inicio'){
      this.router.navigate(['/browse'])

    }
    // Puedes agregar más navegaciones para otros ítems
  }
  logout() {
    // Aquí implementas la lógica de logout
    console.log('Logging out...');
    this.isDropdownOpen = false;
  }
}
