import { Component } from '@angular/core';
import { Product } from '../shared/models/product';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  products: Product[] = [];
  constructor() {
    this.products = [
      new Product('Coffee', 5.9, 'assets/coffee.jpg'),
      new Product('Rainbow Shake', 7.2, 'assets/rainbow.jpg'),
      new Product('Taco', 4.5, 'assets/taco.jpg'),
      new Product('Sandwich', 6.5, 'assets/sandwich.jpg'),
    ]
  }

}
