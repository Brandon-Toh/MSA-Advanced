import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  isUser = false;
  isManager = false;

  constructor(private authService: AuthService, private router: Router) { 
    // Observe auth state
    this.authService.watchAuthState(async (user) => {
      if (user && user.email) {
        const doc = await firebase.firestore().collection('users').doc(user.email).get();
        const role = doc.data()?.['role'];

        this.isUser = role === 'user';
        this.isManager = role === 'manager';
      } else {
        this.isUser = false;
        this.isManager = false;
      }
    })
  }

  async signOutUser() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
