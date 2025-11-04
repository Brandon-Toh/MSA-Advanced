import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
  standalone: false,
})
export class EditProductPage implements OnInit {
  productId: string="";

  constructor(private route: ActivatedRoute, private router: Router) { 
    this.productId = this.route.snapshot.params['id'];
  }

  ngOnInit() {
  }

  update() {
    this.router.navigate(['tabs/tab2'])
  }

}
