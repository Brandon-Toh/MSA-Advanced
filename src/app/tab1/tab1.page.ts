import { Component } from '@angular/core';
import { ProductService } from '../shared/services/product';
import { Product } from '../shared/models/product';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
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

}
