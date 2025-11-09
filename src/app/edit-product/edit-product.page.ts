import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ProductService } from '../shared/services/product';
import { Product } from '../shared/models/product';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
  standalone: false,
})
export class EditProductPage implements OnInit {
  productId: string="";
  product: Product | undefined;
  productImage: string | undefined;

  constructor(private route: ActivatedRoute, private router: Router, private productService: ProductService) { 
    this.productId = this.route.snapshot.params['id'];
    this.product = this.productService.getProductById(this.productId);
    this.productImage = this.product!.image;
  }

  ngOnInit() {
  }

  update() {
    this.router.navigate(['tabs/tab2'])
  }

}
