import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }

  async signIn() {
    // TODO: Based on user role go to different page
    this.errorMessage = '';
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    try {
      const userCredential = await this.authService.signInWithEmail(email, password);
      const user = userCredential.user;

      if (user && user.email) {
        // Get role from Firestore
        const userDoc = await this.authService.fetchUserRole(user.email);
        const role = userDoc.data()?.['role'];

        if (role === 'user') {
          this.router.navigate(['/tabs/new-loan']);
        } else if (role === 'manager') {
          this.router.navigate(['/tabs/manage']);
        }
      }
    } catch (error: any) {
      const code = error?.code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        this.errorMessage = 'The password you entered is wrong. Please try again.';
      } else if (code === 'auth/user-not-found') {
        this.errorMessage = 'No account found with that email. Please check and try again.';
      } else if (code === 'auth/invalid-email') {
        this.errorMessage = 'Please enter a valid email address.';
      } else {
        this.errorMessage = 'The password you entered is wrong. Please try again.';
      }
    }
  }
}
