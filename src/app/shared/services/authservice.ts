import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  watchAuthState(func: firebase.Observer<any, Error> | ((a: firebase.User | null) => any)){
    return firebase.auth().onAuthStateChanged(func);
  }

  signInWithEmail(email: string, password: string){
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  signOut() {
    return firebase.auth().signOut();
  }

  registerWithEmail(email: string, password: string){
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }
}
