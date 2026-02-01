import { Component } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  platform: any;
  constructor() {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBJEwse3GvoAGeDciqQZFdIDZVdMdzCFC8",
      authDomain: "assignment2-msa-advanced.firebaseapp.com",
      projectId: "assignment2-msa-advanced",
      storageBucket: "assignment2-msa-advanced.firebasestorage.app",
      messagingSenderId: "487116803945",
      appId: "1:487116803945:web:751426d808317e535ff7f8",
      measurementId: "G-LC892B1F6G"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.firestore().settings({ experimentalForceLongPolling: true });
  }

  initializeApp() {

    this.platform.ready().then(() => {
    });
  }

}
