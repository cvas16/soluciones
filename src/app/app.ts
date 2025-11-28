import { Component, signal} from '@angular/core';
import { RouterOutlet} from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { Footer } from './shared/components/footer/footer';
@Component({
  selector: 'app-root',
  standalone:true,
  imports: [CommonModule, RouterOutlet,Navbar,Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('PROYECTO');
}
