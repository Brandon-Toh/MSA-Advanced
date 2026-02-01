import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Authservice } from '../shared/services/authservice';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: false
})
export class SignupPage implements OnInit {
  signupForm: FormGroup;
  signupError: string="";

  constructor(private modalController: ModalController, private authService: Authservice) {
    this.signupForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    })
  }

  ngOnInit() {
  }

  registerAccount() {
    this.authService.registerWithEmail(
      this.signupForm.value.email,
      this.signupForm.value.password
    )
    .then(user => this.modalController.dismiss()
    )
    .catch(
      error => this.signupError = error.message
    )
  }

}
