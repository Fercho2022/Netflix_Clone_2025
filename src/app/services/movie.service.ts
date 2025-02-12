import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private http = inject(HttpClient);

  private baseUrl = 'https://api.themoviedb.org/3';

  private options = {
    params: {
      include_adult: 'false',
      include_video: 'true',
      language: 'en-US',
      page: '1',
      sort_by: 'popularity.desc',
    },
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjMmQzY2RiYzkyZTAxYzczZjA5NTAxZTJjZGEzZjkwZSIsIm5iZiI6MTczODUyMjg3NC4xMTEsInN1YiI6IjY3OWZjMGZhMDJhNzRkYzczZjk1NWE1ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KayrFEuVYWI6GmHY24V7XIm_BYqYCkk5udMyc1rn3VM',
    },
  };

  constructor() {}

  // Obtener películas populares
  getPopularMovies(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/movie/popular`, this.options);
  }
  getTopRatedMovies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/top_rated`, this.options);
  }
  getUpcomingMovies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/upcoming`, this.options);
  }
  getNowPlayingMovies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/now_playing`, this.options);
  }
  getTVShows(): Observable<any> {
    return this.http.get(`${this.baseUrl}/discover/tv`, this.options);
  }
  getBannerImage() {
    return this.http.get(
      `https://api.themoviedb.org/3/movie/575264/images`,
      this.options
    );
  }

  getBannerVideo() {
    return this.http.get(
      `https://api.themoviedb.org/3/movie/575264/videos`,
      this.options
    );
  }

  getBannerDetail() {
    return this.http.get(
      `https://api.themoviedb.org/3/movie/575264`,
      this.options
    );
  }
}
