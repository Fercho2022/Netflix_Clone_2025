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

    let mediaType: 'movie' | 'tv' = 'movie';
    if (movie.name && !movie.title) {
      mediaType = 'tv';
    }

    this.movieService
      .getVideoTrailer(movie.id, mediaType)
      .subscribe((trailer) => {
        if (trailer) {
          console.log(trailer);
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube-nocookie.com/embed/${trailer.key}?` +
              `autoplay=0` + // Sin reproducción automática
              `&mute=1` + // Iniciar muteado
              `&controls=0` + // Sin controles de YouTube
              `&disablekb=1` + // Deshabilitar controles de teclado
              `&modestbranding=1` + // Logo de YouTube discreto
              `&iv_load_policy=3` + // Sin anotaciones
              `&rel=0` + // Sin videos relacionados
              `&showinfo=0` + // Sin información del video
              `&fs=0` + // Sin botón de pantalla completa
              `&cc_load_policy=0` + // Sin subtítulos
              `&enablejsapi=1` // Habilitar API JS para control
          );
          this.isPlaying = false; // Iniciar con estado "pausado"
        }
        this.isLoading = false;
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
