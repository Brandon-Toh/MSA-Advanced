import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: false
})
export class SignupPage implements OnInit {
  signupForm: FormGroup;

  constructor(private modalController: ModalController) {
    this.signupForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    })
  }

  ngOnInit() {
  }

  signup() {
    this.modalController.dismiss();
  }

}
