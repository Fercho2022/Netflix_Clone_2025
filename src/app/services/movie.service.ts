import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { VideoResponse } from '../interfaces/Video/VideoResponse';
import { Video } from '../interfaces/Video/Videos';

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
      language: 'es-ES',
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
    return this.http.get(`${this.baseUrl}/tv/top_rated`, this.options);
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

  // Luego modificamos la función para usar estos tipos
  getVideoTrailer(
    id: number,
    mediaType: 'movie' | 'tv'
  ): Observable<Video | undefined> {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    return this.http
      .get<VideoResponse>(
        `${this.baseUrl}/${endpoint}/${id}/videos`,
        this.options
      )
      .pipe(
        map((response: VideoResponse) => {
          const videos = response.results;


          // Primero intentamos encontrar un trailer oficial
          let video = videos.find(
            (video) =>
              video.type === 'Trailer' &&
              video.site === 'YouTube' &&
              video.official === true
          );

          // Si no hay trailer, buscamos cualquier video oficial
          if (!video) {
            video = videos.find(
              (video) => video.site === 'YouTube' && video.official === true
            );
          }

          // Si aún no hay video, tomamos el primero disponible de YouTube
          if (!video && videos.length > 0) {
            video = videos.find((video) => video.site === 'YouTube');
          }

          return video;
        }),
        catchError((error) => {
          console.log(`No videos found for ${mediaType} with ID ${id}`);
          return of(undefined); // Devuelve undefined en caso de error
        })
      );
  }
}
