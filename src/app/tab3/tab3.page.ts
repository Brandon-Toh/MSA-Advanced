import { Component } from '@angular/core';
import { LoginPage } from '../login/login.page'
import { ModalController } from '@ionic/angular';
import { SignupPage } from '../signup/signup.page';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  constructor(private modalController: ModalController) {}

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
