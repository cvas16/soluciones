import { Component ,Input} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
@Component({
  selector: 'app-spinner',
  standalone:true,
  imports: [CommonModule, NgIf],
  templateUrl: './spinner.html',
  styleUrls: ['./spinner.css'],
})
export class Spinner {
  @Input() message: string | null = null;
}
