import { Component } from '@angular/core';

@Component({
  selector: 'digital-defiance-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'langex';
  constructor() {
    console.log('AppComponent constructor');
  }
}
