import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  standalone: false,
})
export class AddProductPage implements OnInit {
  // productId: string="";
  addProductForm: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router) { 
    // this.productId = this.route.snapshot.params['id'];
    this.addProductForm = new FormGroup({
      name: new FormControl(''), 
      price: new FormControl(0), 
      category: new FormControl('Food'),       
      vegetarian: new FormControl(true) 
    })
  }

  ngOnInit() {
  }

  add() {
    this.router.navigate(['tabs/tab2'])
  }

}
