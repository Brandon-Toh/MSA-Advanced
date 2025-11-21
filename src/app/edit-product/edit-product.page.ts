import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ProductService } from '../shared/services/product';
import { Product } from '../shared/models/product';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { positiveNumber } from '../shared/services/positiveNumber.validator';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
  standalone: false,
})
export class EditProductPage implements OnInit {
  editProductForm: FormGroup;
  productId: string="";
  product: Product | undefined;
  productImage: string | undefined;
  categories: string[]|undefined;
  submitted: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private productService: ProductService) { 
    this.productId = this.route.snapshot.params['id'];
    this.product = this.productService.getProductById(this.productId);
    this.productImage = this.product!.image;
    this.categories = ['Main', 'Beverage', 'Dessert'];
    this.editProductForm = new FormGroup({
      name: new FormControl(this.product?.name, [Validators.required]), 
      price: new FormControl(this.product?.price, [positiveNumber]), 
      category: new FormControl(this.product?.category),       
      vegetarian: new FormControl(this.product?.vegetarian) 
    })
  }

  ngOnInit() {
  }

  update() {
    this.submitted = true;
    
    if (this.editProductForm.valid && this.product) {
      const prod = new Product(
        this.editProductForm.value.name,
        this.editProductForm.value.price,
        this.product.image,
        this.product.id
      );
      prod.category = this.editProductForm.value.category;
      prod.vegetarian = this.editProductForm.value.vegetarian;
      this.productService.update(prod);
      
      this.router.navigate(['tabs/tab2'])
    }  
  }
}
