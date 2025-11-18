import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../shared/services/product';
import { Product } from '../shared/models/product';
import { positiveNumber } from '../shared/services/positiveNumber.validator';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  standalone: false,
})
export class AddProductPage implements OnInit {
  // productId: string="";
  addProductForm: FormGroup;
  categories: string[]|undefined;
  submitted: boolean = false;

  constructor(private router: Router, private productService: ProductService) { 
    // this.productId = this.route.snapshot.params['id'];
    this.categories = ['Main', 'Beverage', 'Dessert'];
    this.addProductForm = new FormGroup({
      name: new FormControl('', [Validators.required]), 
      price: new FormControl(0, [positiveNumber]), 
      category: new FormControl('Main'),       
      vegetarian: new FormControl(true) 
    })
  }

  ngOnInit() {
  }

  add() {
    this.submitted = true;

    if (this.addProductForm.valid) {
      const prod = new Product(
        this.addProductForm.value.name,
        this.addProductForm.value.price,
        "",
        this.addProductForm.value.name);
      prod.category = this.addProductForm.value.category;
      prod.vegetarian = this.addProductForm.value.vegetarian;
      this.productService.add(prod);
      
      this.router.navigate(['tabs/tab2'])
    }
  }
}
