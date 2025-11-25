import { Component } from '@angular/core';
import { ProductService } from '../shared/services/product';
import { Product } from '../shared/models/product';
import { ToastController } from '@ionic/angular';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  searchControl = new FormControl('');
  products: Product[] = [];

  constructor(private productService: ProductService, private toastController: ToastController) {
    this.products = this.productService.getProducts();
  }

  async addToCart(item: Product) {
    const toast = await this.toastController.create({
      message: item.name + ' added to cart',
      duration: 2000,
      position: 'top',
      color: 'secondary'
    });
    toast.present();
  }

  async addToFav(item: Product) {
    const toast = await this.toastController.create({
      message: item.name + ' added to favourite',
      duration: 2000,
      position: 'top',
      color: 'secondary'
    });
    toast.present();
  }

  search(event) {
    // Get the text typed by the user in the search bar
    const text = event.target.value;
    //Get all products again from the service
    const allProducts = this.productService.getProducts();

    if (text && text.trim() !== '') {
      // Use all products to filter
      this.products = allProducts.filter(
        item => item.name.toLowerCase().includes(text.toLowerCase())
      )
    } else {
      // Blank text, clear the search, show all products
      this.products = allProducts;
    }
  }

  refresh($event) {
    this.searchControl.setValue('');
    $event.target.complete();
    this.products = this.productService.getProducts();
  }

}
