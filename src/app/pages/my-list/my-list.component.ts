import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header.component';
import { Movie } from '../../interfaces/Movie/Movie';
import { FavoriteService } from '../../services/FavoriteService/favorite.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/MovieService/movie.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './my-list.component.html',
  styleUrl: './my-list.component.css',
})
export class MyListComponent implements OnInit {

  private favoriteService = inject(FavoriteService);
  private router = inject(Router);
  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);

  favorites: Movie[] = [];
  userProfileImg: string = '';

  // Propiedades para el reproductor de pantalla completa
  showFullscreenTrailer: boolean = false;
  trailerUrl: SafeResourceUrl | null = null;
  selectedMovie: Movie | null = null;
  isTransitioning: boolean = false;

  // Propiedades adicionales para el modal detallado
  selectedFavorite: Movie | null = null;
  showDetailModal: boolean = false;
  detailModalTrailerUrl: SafeResourceUrl | null = null;
  detailModalTrailerLoading: boolean = false;
  similarContent: Movie[] = [];
  @ViewChild('detailModalPlayer') detailModalPlayer!: ElementRef;

  // Diccionario simple de géneros (en una implementación real vendría de la API)
  private genres: Record<number, string> = {
    28: 'Acción',
    12: 'Aventura',
    16: 'Animación',
    35: 'Comedia',
    80: 'Crimen',
    99: 'Documental',
    18: 'Drama',
    10751: 'Familiar',
    14: 'Fantasía',
    36: 'Historia',
    27: 'Terror',
    10402: 'Música',
    9648: 'Misterio',
    10749: 'Romance',
    878: 'Ciencia ficción',
    10770: 'Película de TV',
    53: 'Thriller',
    10752: 'Guerra',
    37: 'Western'
  };

  ngOnInit(): void {
    // Cargar la imagen de perfil
    if (typeof sessionStorage !== 'undefined') {
      const userData = JSON.parse(
        sessionStorage.getItem('loggedInUser') || '{}'
      );
      this.userProfileImg = userData.picture || '';
    }

    // Suscribirse a cambios en favoritos
    this.favoriteService.favorites$.subscribe((favorites) => {
      this.favorites = favorites;
    });
  }

  removeFromFavorites(movie: Movie, event: Event) {
    event.stopPropagation();  // Evitar que se propague el evento
    this.favoriteService.toggleFavorite(movie);
  }

  playMovie(movie: Movie, event: Event) {
    // Aquí podrías implementar la reproducción o navegación a los detalles
    event.stopPropagation();
    this.selectedMovie = movie;
    this.isTransitioning = true;

    // Determinar si es película o serie
    const mediaType = movie.title ? 'movie' : 'tv';

    this.movieService.getVideoTrailer(movie.id, mediaType).subscribe({
      next: (trailer) => {
        if (trailer) {
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1`
          );

          // Activamos la transición y después de 1 segundo mostramos el trailer en pantalla completa
          setTimeout(() => {
            this.showFullscreenTrailer = true;
            this.isTransitioning = false;
          }, 1500);
        } else {
          this.isTransitioning = false;
          console.log('No se encontró trailer para esta película');
          // Aquí podrías mostrar algún mensaje al usuario
        }
      },
      error: (err) => {
        this.isTransitioning = false;
        console.error('Error al obtener el trailer:', err);
      }
    });
  }

  closeTrailer() {
    this.isTransitioning = true;
    // Primero iniciamos la transición de salida
    this.showFullscreenTrailer = false;

    // Después de la transición limpiamos los datos
    setTimeout(() => {
      this.trailerUrl = null;
      this.selectedMovie = null;
      this.isTransitioning = false;
    }, 1000);
  }

  getYear(date: string | undefined): string {
    if (!date) return 'N/A';
    return date.split('-')[0];
  }

  // Método para obtener el nombre del género
  getGenreName(genreId: number): string {
    return this.genres[genreId] || 'Desconocido';
  }

  // Método para calcular el porcentaje de coincidencia
  calculateMatchPercentage(rating: number | undefined): number {
    if (!rating) return 0;
    return Math.round(rating * 10);
  }

  // Método para abrir el modal detallado
  openDetailModal(movie: Movie, event: Event) {
    event.stopPropagation();
    this.selectedFavorite = movie;

    // Cargar el trailer y contenido similar
    this.detailModalTrailerLoading = true;
    this.showDetailModal = true;

    // Determinar si es película o serie
    const mediaType = movie.title ? 'movie' : 'tv';

    // Crear un array de observables para ejecutar en paralelo
    const requests = [
      this.movieService.getVideoTrailer(movie.id, mediaType),
      this.movieService.getSimilarContent(movie.id, mediaType)
    ];

    // Ejecutar ambas peticiones en paralelo
    forkJoin(requests).subscribe({
      next: ([trailer, similarResponse]) => {
        // Procesar el trailer
        if (trailer) {
          console.log('Trailer encontrado:', trailer.key);
          this.detailModalTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${trailer.key}?` +
            `autoplay=0` + // Sin reproducción automática inicialmente
            `&mute=1` +
            `&controls=1` +
            `&modestbranding=1` +
            `&showinfo=0` +
            `&rel=0` +
            `&iv_load_policy=3` +
            `&enablejsapi=1`
          );
        } else {
          console.warn('No se encontró trailer para este título');
        }

        // Procesar el contenido similar
        if (similarResponse && similarResponse.results) {
          console.log('Contenido similar recibido:', similarResponse.results.length);

          // Verificar y limpiar los datos
          const validContent = similarResponse.results.filter((movie: Movie) =>
            movie && (movie.poster_path || movie.backdrop_path)
          );

          this.similarContent = validContent.slice(0, 12); // Limitamos a 12 items

          // Log para detectar problemas
          if (this.similarContent.length === 0) {
            console.warn('No hay contenido similar válido para mostrar');
          }
        } else {
          console.warn('No se recibió contenido similar');
          this.similarContent = [];
        }

        this.detailModalTrailerLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos para el modal:', err);
        this.detailModalTrailerLoading = false;
        this.similarContent = [];
      }
    });
  }

  // Método para cerrar el modal detallado
  closeDetailModal() {
    this.showDetailModal = false;
    setTimeout(() => {
      this.selectedFavorite = null;
      this.detailModalTrailerUrl = null;
      this.similarContent = [];
    }, 300); // Esperar a que termine la animación
  }

  // Método para reproducir el video a pantalla completa
  playFullVideo() {
    if (this.selectedFavorite) {
      this.playMovie(this.selectedFavorite, new Event('click'));
      this.closeDetailModal();
    }
  }

  // Método para reproducir el trailer directamente en el modal
  playTrailerInModal() {
    if (!this.selectedFavorite) return;

    console.log('Iniciando reproducción del trailer en modal');

    // Simplificamos el enfoque: siempre cargamos un nuevo trailer con autoplay
    this.detailModalTrailerLoading = true;
    const mediaType = this.selectedFavorite.title ? 'movie' : 'tv';

    this.movieService.getVideoTrailer(this.selectedFavorite.id, mediaType).subscribe({
      next: (trailer) => {
        if (trailer) {
          console.log('Cargando trailer con ID:', trailer.key);

          // Crea una nueva URL con autoplay=1 para garantizar reproducción
          this.detailModalTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${trailer.key}?` +
            `autoplay=1` + // Autoreproducción activada
            `&mute=0` +     // Sin silencio
            `&controls=1` + // Con controles
            `&modestbranding=1` +
            `&showinfo=0` +
            `&rel=0`
          );
        } else {
          console.warn('No se encontró trailer para este título');
          alert('No se encontró trailer para este título');
        }
        this.detailModalTrailerLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el trailer:', err);
        this.detailModalTrailerLoading = false;
        alert('Error al cargar el trailer');
      }
    });
  }

  // Método para reproducir trailer de película/serie desde la sección "similares"
  playMovieFromSimilar(movie: Movie, event: Event) {
    event.stopPropagation(); // Evita que se abra el modal de detalles
    console.log('Reproduciendo trailer de película similar:', movie.title || movie.name);

    // Cerramos temporalmente el modal actual
    this.showDetailModal = false;

    // Esperamos a que se cierre y luego abrimos el nuevo
    setTimeout(() => {
      // Configuramos la película seleccionada
      this.selectedFavorite = movie;
      this.showDetailModal = true;

      // Cargamos y reproducimos el trailer de inmediato
      setTimeout(() => {
        this.playTrailerInModal();
      }, 500);
    }, 300);
  }

  // Método para alternar favoritos desde la sección "similares"
  toggleFavoriteFromSimilar(movie: Movie, event: Event) {
    event.stopPropagation(); // Evita que se abra el modal de detalles

    const isFavorite = this.favoriteService.toggleFavorite(movie);

    // Mostrar un mensaje de confirmación
    console.log(isFavorite ?
      `"${movie.title || movie.name}" agregada a Mi Lista` :
      `"${movie.title || movie.name}" eliminada de Mi Lista`
    );

    // Aquí podrías agregar un toast o notificación visual
  }

  // Método para verificar si una película ya está en favoritos
  isInFavorites(movie: Movie): boolean {
    return this.favorites.some(fav => fav.id === movie.id);
  }
}
