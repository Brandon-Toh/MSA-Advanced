import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class FirebaseProductservice {
  private productsRef = firebase.firestore().collection("products");

  getProducts(): Observable<any> {     
    return new Observable((observer) => {       
      this.productsRef.onSnapshot((querySnapshot) => {         
        let products: Product[] = [];         
        querySnapshot.forEach((doc) => {           
          let data = doc.data();            
          let p = new Product(data['name'], data['price'], data['image'], doc['id']);           
          if (data['category']) p.category = data['category'];           
          if (data['vegetarian']) p.vegetarian = data['vegetarian'];
          // If there's image, read from Firebase Storage          
          if (data['image']) {             
            p.imagePath = data['image'];             
            const imageRef = firebase.storage().ref().child(data['image']);          
          imageRef.getDownloadURL()            
            .then(url => {               
              p.image = url;            
            }).catch(error => {               
              console.log('Error: Read image fail ' + error);            
            });         
          }              
          products.push(p);         
        });         
        observer.next(products);       
      });     
    });   
  }
  
  getProductById(id: string): Observable<any> {     
    return new Observable((observer) => {       
      this.productsRef.doc(id).get().then((doc) => {         
        let data = doc.data();          
        let p = new Product(data!['name'], data!['price'], data!['image'], doc!['id']);           
        if (data!['category']) p.category = data!['category'];           
        if (data!['vegetarian']) p.vegetarian = data!['vegetarian'];           
        // If there's image, read from Firebase Storage           
        if (data!['image']) {             
          p.imagePath = data!['image'];             
          const imageRef = firebase.storage().ref().child(data!['image']);           
        imageRef.getDownloadURL()             
          .then(url => {               
            p.image = url;               
            // Tell the subscriber that image is updated               
            observer.next(p);               
            console.log('Image is ' + p.image);             
          }).catch(error => {               
            console.log('Error: Read image fail ' + error);             
          });         
        }          
        observer.next(p);       
      });     
    });   
  }

  delete(p: Product) { 
    const ref = this.productsRef.doc(p.id); 
    ref.get().then(doc => { 
      if (doc.exists) 
        ref.delete(); 
    }); 
  }

  update(p: Product) {     
    const ref = this.productsRef.doc(p.id);     
    // Update compulsory fields. Do not update id and image     
    ref.update({       
      name: p.name,       
      price: p.price,     
    });     
    // Update optional fields if not undefined     
    if (p.category != undefined)       
      ref.update({         
        category: p.category
      });     
    if (p.vegetarian != undefined)       
      ref.update({         
        vegetarian: p.vegetarian
      });
  }

   add(p: Product) {     
    // Let firebase auto generate id     
    this.productsRef.add({       
      name: p.name,       
      price: p.price,       
      category: p.category,       
      vegetarian: p.vegetarian     
    });   
  } 
}
