import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Movie } from '../../interfaces/Movie/Movie';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private favorites: Movie[] = [];
  // BehaviorSubject que almacena el estado actual de la lista de favoritos y emite actualizaciones
  private favoritesSubject = new BehaviorSubject<Movie[]>([]);
  // Observable público al que los componentes pueden suscribirse para recibir actualizaciones
  // Se usa asObservable() para impedir que externos puedan emitir valores
  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {}

  toggleFavorite(movie: Movie): boolean {
    const index = this.favorites.findIndex((m) => m.id === movie.id);
    if (index === -1) {
      // Agregar a favoritos
      this.favorites.push(movie);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
      this.favoritesSubject.next([...this.favorites]);
      return true;  // Devuelve true si se agregó
    }else{
      // Eliminar de favoritos
      this.favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
      this.favoritesSubject.next([...this.favorites]);
      return false; // Devuelve false si se eliminó
    }
  }
}
