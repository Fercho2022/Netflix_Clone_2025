import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../interfaces/Movie/Movie';
import { register } from 'swiper/element/bundle';
import { CommonModule } from '@angular/common';

register();

@Component({
  selector: 'app-movie-carrousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-carrousel.component.html',
  styleUrls: ['./movie-carrousel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MovieCarrouselComponent implements OnInit {
  private movieService = inject(MovieService);
  movies: Movie[] = [];
  selectedMovie: Movie | null = null;
  showModal = false;
  @Input() peliculas: Movie[]=[];
  @Input() title: string='';
  @Output() movieSelected=new EventEmitter<Movie>();


  ngOnInit() {

  }



  openMovieDetails(movie: Movie) {
    this.selectedMovie = movie;
    this.showModal = true;
    console.log(movie);
    this.movieSelected.emit(movie);
  }

  closeModal() {
    this.showModal = false;
    this.selectedMovie = null;
  }
}
