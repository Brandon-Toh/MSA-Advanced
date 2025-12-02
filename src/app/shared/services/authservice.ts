import { Injectable } from '@angular/core';
import firebase from 'firebase';
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  observeAuthState(func: firebase.Observer<any, Error> | ((a: firebase.User | null) => any)){
    return firebase.auth().onAuthStateChanged(func);
  }

  login(email: string, password: string){
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  logout() {
    return firebase.auth().signOut();
  }

  signup(email: string, password: string){
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }
}
