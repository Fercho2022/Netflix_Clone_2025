import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @Input( {required:true}) userImg:string='';
  navList:string[]=["home", "Tv Shows","News & Popular", "My List", "Browse by"]

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    // Aquí implementas la lógica de logout
    console.log('Logging out...');
    this.isDropdownOpen = false;
  }
}
