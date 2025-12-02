import { Component } from '@angular/core';
import firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyAoOCW5ujHfZStb5zaDO103XLmb8myaPrs",
      authDomain: "it3854s2practical.firebaseapp.com",
      projectId: "it3854s2practical",
      storageBucket: "it3854s2practical.firebasestorage.app",
      messagingSenderId: "705280249816",
      appId: "1:705280249816:web:dca328d553b35b13066cad"
    };
    // Initialize Firebase 
    firebase.initializeApp(firebaseConfig); 
  }
}
