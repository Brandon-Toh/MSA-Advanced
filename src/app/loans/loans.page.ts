import { Component } from '@angular/core';
import { Loan } from '../shared/loan';
import { LoanService } from '../shared/loan.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Component({
  selector: 'app-loans',
  templateUrl: 'loans.page.html',
  styleUrls: ['loans.page.scss'],
  standalone: false,
})
export class LoansPage {
  loans: Loan[];

  constructor(private loanService: LoanService) {
    const user = firebase.auth().currentUser;
    const username = user?.email;

    this.loanService.watchAllLoans()
      .subscribe(data => {
        // Keep loans that belong to currently logged-in user
        this.loans = data.filter(
          (loan: Loan) => loan.username === username
        );
      })
  }

}
