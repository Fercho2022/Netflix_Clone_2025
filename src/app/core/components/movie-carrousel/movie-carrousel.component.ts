import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MovieService } from '../../../services/MovieService/movie.service';
import { Movie } from '../../../interfaces/Movie/Movie';
import { register } from 'swiper/element/bundle';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FavoriteService } from '../../../services/FavoriteService/favorite.service';

register();

@Component({
  selector: 'app-movie-carrousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-carrousel.component.html',
  styleUrls: ['./movie-carrousel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MovieCarrouselComponent implements OnInit {
  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private favoritesService = inject(FavoriteService);

  movies: Movie[] = [];
  selectedMovie: any | null = null;
  showModal = false;

  @Input() peliculas: Movie[] = [];
  @Input() title: string = '';
  @Output() movieSelected = new EventEmitter<Movie>();

  isLoading: boolean = true;

  //----------Agregados para el trailer----------------------
  trailerUrl: SafeResourceUrl | null = null;
  isPlaying: boolean = true;
  isFavorite: boolean = false;

  @ViewChild('modalYoutubePlayer') modalYoutubePlayer!: ElementRef;

  ngOnInit() {}

  openMovieDetails(movie: any) {
    this.selectedMovie = movie;
    this.showModal = true;
    this.isLoading = true; // Activar loading
    this.movieSelected.emit(movie);

    // Detectar si es película o serie

    let mediaType: 'movie' | 'tv' = 'movie'; // Por defecto asumimos película
    if (movie.name && !movie.title) {
      mediaType = 'tv'; // Si tiene name pero no title, es una serie
    }

    // En el método que carga el trailer (por ejemplo, openMovieDetails)
    this.movieService
      .getVideoTrailer(movie.id, mediaType)
      .subscribe((trailer) => {
        if (trailer) {
          console.log(trailer);
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube-nocookie.com/embed/${trailer.key}?` +
              `autoplay=1` + // Reproducción automática
              `&mute=0` + // Con sonido
              `&controls=0` + // Sin controles
              `&disablekb=1` + // Deshabilitar teclado
              `&modestbranding=1` + // Logo de YouTube discreto
              `&iv_load_policy=3` + // Ocultar anotaciones
              `&rel=0` + // Sin videos relacionados
              `&showinfo=0` + // Sin información del video
              `&fs=0` + // Sin botón de pantalla completa
              `&cc_load_policy=0` + // Sin subtítulos
              `&enablejsapi=1` // Habilitar API JS para control
          );
          this.isPlaying = true; // Iniciar con estado "reproduciendo"
        }
        this.isLoading = false; // Desactivar loading cuando se complete
      });
  }

  closeModal() {
    this.showModal = false;
    this.selectedMovie = null;
    this.trailerUrl = null;
  }

  toggleVideoPlayback() {
    if (this.modalYoutubePlayer && this.modalYoutubePlayer.nativeElement) {
      const iframe = this.modalYoutubePlayer.nativeElement;
      if (this.isPlaying) {
        iframe.contentWindow.postMessage(
          '{"event":"command", "func": "pauseVideo", "args": ""}',
          '*'
        );
      } else {
        iframe.contentWindow.postMessage(
          '{"event":"command", "func": "playVideo", "args": ""}',
          '*'
        );
      }
      this.isPlaying = !this.isPlaying;
    }
  }

  toggleFavorite() {
    if (this.selectedMovie) {
      this.isFavorite = this.favoritesService.toggleFavorite(
        this.selectedMovie
      );
      if (this.isFavorite) {
        // Si se agregó a favoritos, cerrar el modal y navegar a Mi Lista
        this.closeModal();
        this.router.navigate(['/my-list']);
      }
    }
  }
}
