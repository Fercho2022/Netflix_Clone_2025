import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
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
  videoUrl!: SafeResourceUrl;
  isPlaying: boolean = false;
  @Input({required:true}) bannerTitle!: string;
  @Input() bannerOverview!:string;
  private _videoId:string='HehXywNUp6E'; // Video inicial por defecto


  @Input() set videoId(value:string){
    if(value){
      this._videoId=value;
      this.updateVideoUrl();
    }
  }

  constructor() {

    this.updateVideoUrl();
  }


  updateVideoUrl(){
    if (!this._videoId) {
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${this._videoId}?` +
      `enablejsapi=1` +
      `&controls=0` +
      `&loop=1` +
      `&playlist=${this._videoId}` +
      `&modestbranding=1` +
      `&showinfo=0` +
      `&rel=0` +
      `&iv_load_policy=3` +
      `&cc_load_policy=3` +
      `&disablekb=1` +
      `&playsinline=1` +
      `&autoplay=0` +
      `&mute=1` +
      `&cc=0` +
      `&hl=en`
    );
  }
  ngOnInit() {
    // El video se iniciará automáticamente cuando el componente se monte
  }

  handleIframeError(event: any) {
    console.log('Iframe error:', event);
    // Podríamos mostrar una imagen de fallback u otro contenido
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
