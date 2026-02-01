import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  // Observe login/logout state
  watchAuthState(func: firebase.Observer<any, Error> | ((a: firebase.User | null) => any)) {
    return firebase.auth().onAuthStateChanged(func);
  }

  signInWithEmail(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  signOut() {
    return firebase.auth().signOut();
  }

  fetchUserRole(email: string) {
    return firebase.firestore().collection('users').doc(email).get()
  }
}
