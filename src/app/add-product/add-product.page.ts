import { Component, OnInit } from '@angular/core';
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

  constructor(private route: ActivatedRoute, private router: Router) { 
    // this.productId = this.route.snapshot.params['id'];
  }

  ngOnInit() {
  }

  add() {
    this.router.navigate(['tabs/tab2'])
  }

}
