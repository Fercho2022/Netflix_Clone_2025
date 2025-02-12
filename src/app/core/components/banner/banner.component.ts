import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent {
  @ViewChild('youtubePlayer') youtubePlayer!: ElementRef;
  private sanitizer = inject(DomSanitizer);
  videoUrl: SafeResourceUrl;
  isPlaying: boolean = false;

  constructor() {
    const videoId = '_HUjUzHP-Fs';
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&cc_load_policy=3&disablekb=1&playsinline=1&autoplay=1&mute=1&cc_lang_pref=&cc=0&hl=en` // Agregamos autoplay=1
    );
  }

  ngOnInit() {
    // El video se iniciará automáticamente cuando el componente se monte
  }

  toogleVideo() {
    const iframe = this.youtubePlayer.nativeElement;
    if (!this.isPlaying) {
      iframe.contentWindow.postMessage(
        '{"event":"command", "func": "playVideo", "args": ""}',
        '*'
      );
    } else {
      iframe.contentWindow.postMessage(
        '{"event":"command", "func": "pauseVideo", "args": ""}',
        '*'
      );
    }
    this.isPlaying = !this.isPlaying;
  }
}
