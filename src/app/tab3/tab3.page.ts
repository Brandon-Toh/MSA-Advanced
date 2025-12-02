import { Component } from '@angular/core';
import { LoginPage } from '../login/login.page'
import { ModalController } from '@ionic/angular';
import { SignupPage } from '../signup/signup.page';
import { Authservice } from '../shared/services/authservice';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  userEmail: any;

  constructor(private modalController: ModalController, private authService: Authservice) {
    this.authService.observeAuthState(user => {
      // User is logged in
      if (user) {
        this.userEmail = user.email;
      }
      // User has logged out
      else {
        this.userEmail = undefined;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  async login() {
    const modal = await this.modalController.create({
      component: LoginPage
    });
    return await modal.present();
  }

  async signup() {
    const modal = await this.modalController.create({
      component: SignupPage
    });
    return await modal.present();
  }
}
