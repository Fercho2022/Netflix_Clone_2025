import { BannerComponent } from './../../core/components/banner/banner.component';
import { AfterViewInit, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/AuthService/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../core/components/header/header.component';
import { MovieService } from '../../services/movie.service';
import { MovieCarrouselComponent } from "../../core/components/movie-carrousel/movie-carrousel.component";
import { Movie } from '../../interfaces/Movie/Movie';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [HeaderComponent, BannerComponent, MovieCarrouselComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css',
})
export class BrowseComponent implements AfterViewInit, OnInit {

  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private movieService=inject(MovieService);
  userName: string = '';
  userProfileImg:string='';
  email:string='';

 // Create separate arrays for each movie category

  tvShows: Movie[] = [];
  ratedMovies: Movie[] = [];
  nowPlayingMovies: Movie[] = [];
  popularMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];
  upcomingMovies: Movie[] = [];



  ngOnInit(): void {

    if(isPlatformBrowser(this.platformId)){
      const userData= JSON.parse(sessionStorage.getItem('loggedInUser') || '');
      this.userName=userData.name;
      this.userProfileImg=userData.picture;
      this.email=userData.email;
    }
      // Subscribe to each movie source
    this.movieService.getPopularMovies().subscribe(
      response => {
        this.popularMovies = response.results;
      }
    );

    this.movieService.getTopRatedMovies().subscribe(
      response => {
        this.topRatedMovies = response.results;
      }
    );

    this.movieService.getUpcomingMovies().subscribe(
      response => {
        this.upcomingMovies = response.results;
      }
    );

    this.movieService.getNowPlayingMovies().subscribe(
      response => {
        this.nowPlayingMovies = response.results;
      }
    );

    this.movieService.getTVShows().subscribe(
      response => {
        this.tvShows = response.results;
      }
    );

  }

  ngAfterViewInit(){
    if(isPlatformBrowser(this.platformId)){
      const userData= JSON.parse(sessionStorage.getItem('loggedInUser') || '');
      this.userName=userData.name;
      this.userProfileImg=userData.picture;
      this.email=userData.email;
    }

  }

  signOut() {
    this.authService.signOut();
  }
}
