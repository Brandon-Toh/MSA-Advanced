import { Component } from '@angular/core';
import { Product } from '../shared/models/product';
import { ProductService } from '../shared/services/product';
import { FirebaseProductservice } from '../shared/services/firebase-productservice';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  products: Product[] = [];
  constructor(private productService: FirebaseProductservice) {
    // this.products = [
    //   new Product('Coffee', 5.9, 'assets/coffee.jpg', 'coffee'),
    //   new Product('Rainbow Shake', 7.2, 'assets/rainbow.jpg', 'shake'),
    //   new Product('Taco', 4.5, 'assets/taco.jpg', 'taco'),
    //   new Product('Sandwich', 6.5, 'assets/sandwich.jpg', 'sandwich'),
    // ]
    // this.products = this.productService.getProducts();
    this.productService.getProducts()       
    .subscribe(data => {         
      this.products = data; 
    }); 
  }

  delete(item: Product) {
    this.productService.delete(item);
  }

}
