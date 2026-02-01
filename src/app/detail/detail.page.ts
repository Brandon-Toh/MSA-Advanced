import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan } from '../shared/loan';
import { LoanService } from '../shared/loan.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailPage {
  loan: Loan|undefined;
  loanId: string = "";

  constructor(private route: ActivatedRoute, private loanService: LoanService, private router: Router) { 
    this.loanId = this.route.snapshot.params['id'];
    // Fetch loan details based on loanId
    this.loanService.fetchLoanById(this.loanId).then(data => {
      this.loan = data;
    })
  }

  withdrawLoan() {
    // Delete loan from Firestore
    this.loanService.removeLoan(this.loanId).then(() => {
      this.router.navigate(['/tabs/loans'])
    })
  }

}
