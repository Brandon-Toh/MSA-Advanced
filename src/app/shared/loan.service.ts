import { Injectable } from '@angular/core';
import { Item } from './item';
import { Loan } from './loan';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  constructor() { }

  submitLoan(items: Item[]) {

    // Due date is 2 weeks after today 
    let duedate = new Date(); // Today
    duedate.setHours(0, 0, 0, 0); // Midnight
    duedate.setDate(duedate.getDate() + 14); // 2 weeks later

    const user = firebase.auth().currentUser;
    // Get the email of the currently logged-in user
    let username = user?.email;

    // TODO: Get username logged in
    let loan = new Loan(username, 'pending', duedate);
    const createdAt = new Date();
    const dayIndex = createdAt.getDay();
    const timeSlot = this.getTimeSlot(createdAt);

    // Add to collection '/loans/<autoID>' 
    return firebase.firestore().collection('loans').add({
      username: loan.username,
      status: loan.status,
      duedate: loan.duedate,
      dayIndex: dayIndex,
      timeSlot: timeSlot,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(doc => {
      loan.id = doc.id;
      // Add to collection '/loans/<autoID>/items/'
      for (let item of items) {
        if (item.quantity > 0) {
          // Add a new document '/loans/<autoID>/items/<itemID>'
          firebase.firestore().collection('loans/' + doc.id + '/items/').doc(item.id).set({
            quantity: item.quantity
          });
        }
      }
      return loan;
    })

  }

  private getTimeSlot(date: Date): string {
    const hour = date.getHours();
    if (hour < 12) {
      return 'morning';
    }
    if (hour < 18) {
      return 'afternoon';
    }
    return 'evening';
  }

  watchAllLoans(): Observable<any> {
    return new Observable(observer => {
      // Read collection '/loans'
      firebase.firestore().collection('loans').orderBy('duedate').onSnapshot(collection => {
        let array = [];
        collection.forEach(doc => {

          // Add loan into array if there's no error
          try {
            let loan = new Loan(doc.data()['username'], doc.data()['status'], doc.data()['duedate'].toDate(), doc.id);
            array.push(loan);

            // Read subcollection '/loans/<autoID>/items'
            let dbItems = firebase.firestore().collection('loans/' + doc.id + '/items');
            dbItems.onSnapshot(itemsCollection => {
              loan.items = []; // Empty array
              itemsCollection.forEach(itemDoc => {
                let item = new Item(itemDoc.id, itemDoc.data()['quantity']);
                loan.items.push(item);
              });
            });
          } catch (error) { }

        });
        observer.next(array);
      });
    });
  }

  watchPendingLoans(): Observable<any> {
    return new Observable(observer => {
      // Read collection '/loans'
      firebase.firestore().collection('loans').where('status', '==', 'pending').onSnapshot(collection => {
        let array = [];
        collection.forEach(doc => {

          // Add loan into array if there's no error
          try {
            let loan = new Loan(doc.data()['username'], doc.data()['status'], doc.data()['duedate'].toDate(), doc.id);
            array.push(loan);

            // Read subcollection '/loans/<autoID>/items'
            let dbItems = firebase.firestore().collection('loans/' + doc.id + '/items');
            dbItems.onSnapshot(itemsCollection => {
              loan.items = []; // Empty array
              itemsCollection.forEach(itemDoc => {
                let item = new Item(itemDoc.id, itemDoc.data()['quantity']);
                loan.items.push(item);
              });
            });
          } catch (error) { }

        });
        observer.next(array);
      });
    });
  }

  fetchLoanById(id: string) {
    // Read document '/loans/<id>'
    return firebase.firestore().collection('loans').doc(id).get().then(doc => {
      let loan = new Loan(doc.data()['username'], doc.data()['status'], doc.data()['duedate'].toDate(), doc.id);

      // Read subcollection '/loans/<id>/items'
      return firebase.firestore().collection('loans/' + id + '/items').get().then(collection => {
        loan.items = []; // Empty array
        collection.forEach(doc => {
          let item = new Item(doc.id, doc.data()['quantity']);
          loan.items.push(item);
        })
        return loan;
      });
    });
  }

  removeLoan(id: string) {
    // Reference to document '/loans/<id>'
    const loanRef = firebase.firestore().collection('loans').doc(id);

    return loanRef.collection('items').get().then(items => {
      items.forEach(item => {
        item.ref.delete();
      });

      // Delete document '/loans/<id>'
      return loanRef.delete();
    })
  }

  setLoanStatus(id: string, status: string) {
    // Locate document '/loans/<id>' and update 'status' field
    return firebase.firestore()
      .collection('loans')
      .doc(id)
      .update({ status: status });
  }

}
