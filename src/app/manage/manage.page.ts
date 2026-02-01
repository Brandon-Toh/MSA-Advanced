import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Loan } from '../shared/loan';
import { Item } from '../shared/item';
import { InventoryItem, InventoryService } from '../shared/inventory.service';
import { LoanService } from '../shared/loan.service';
import { LoanRiskService, RiskInsight, RiskLevel } from '../shared/loan-risk.service';
import { ItemService } from '../shared/item.service';

@Component({
  selector: 'app-manage',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss'],
  standalone: false,
})
export class ManagePage implements OnDestroy {
  loans: Loan[] = [];
  riskInsights: RiskInsight[] = [];
  inventoryItems: InventoryItem[] = [];
  inventoryEdits: Record<string, number> = {};
  selectedRiskItemId: string | null = null;
  showRiskConfirm = false;

  private pendingApprovalLoan: Loan | null = null;
  private subscriptions = new Subscription();
  private riskByItemId = new Map<string, RiskInsight>();
  private baseItems: Item[] = [];

  riskConfirmButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        this.pendingApprovalLoan = null;
      }
    },
    {
      text: 'Approve',
      handler: () => {
        if (this.pendingApprovalLoan) {
          this.loanService.setLoanStatus(this.pendingApprovalLoan.id!, 'approved');
        }
        this.pendingApprovalLoan = null;
      }
    }
  ];

  constructor(
    private loanService: LoanService,
    private loanRiskService: LoanRiskService,
    private inventoryService: InventoryService,
    private itemService: ItemService
  ) {
    this.baseItems = this.itemService.getAll();

    // Fetch all pending loans
    this.subscriptions.add(
      this.loanService.watchPendingLoans()
        .subscribe(data => {
          this.loans = data;
        })
    );

    // Fetch real-time risk insights
    this.subscriptions.add(
      this.loanRiskService.watchRiskInsights()
        .subscribe(insights => {
          this.riskInsights = insights;
          this.riskByItemId = new Map(insights.map(insight => [insight.itemId, insight]));
        })
    );

    // Fetch inventory stock for manager editing
    this.subscriptions.add(
      this.inventoryService.watchInventory()
        .subscribe(items => {
          this.inventoryItems = this.mergeInventoryWithBase(items);
          this.inventoryItems.forEach(item => {
            if (this.inventoryEdits[item.id] === undefined) {
              this.inventoryEdits[item.id] = item.available;
            }
          });
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get filteredLoans(): Loan[] {
    if (!this.selectedRiskItemId) {
      return this.loans;
    }

    return this.loans.filter(loan =>
      loan.items?.some(item => item.id === this.selectedRiskItemId)
    );
  }

  applyRiskFilter(itemId: string) {
    this.selectedRiskItemId = itemId;
  }

  clearRiskFilter() {
    this.selectedRiskItemId = null;
  }

  updateInventory(itemId: string) {
    const next = Number(this.inventoryEdits[itemId]);
    if (!Number.isFinite(next) || next < 0) {
      this.inventoryEdits[itemId] = this.getInventoryAvailable(itemId);
      return;
    }

    this.inventoryService.setAvailable(itemId, Math.floor(next));
  }

  getInventoryAvailable(itemId: string): number {
    return this.inventoryItems.find(item => item.id === itemId)?.available ?? 0;
  }

  approveSelectedLoan(loan: Loan) {
    if (this.isHighRiskLoan(loan)) {
      this.pendingApprovalLoan = loan;
      this.showRiskConfirm = true;
      return;
    }

    this.loanService.setLoanStatus(loan.id!, 'approved');
  }

  rejectSelectedLoan(loan: Loan) {
    this.loanService.setLoanStatus(loan.id!, 'rejected');
  }

  onRiskConfirmDismiss() {
    this.showRiskConfirm = false;
  }

  getItemRiskLevel(itemId: string): RiskLevel {
    return this.riskByItemId.get(itemId)?.riskLevel ?? 'low';
  }

  getRiskLabel(level: RiskLevel): string {
    if (level === 'high') {
      return 'High Risk';
    }
    if (level === 'medium') {
      return 'Medium Risk';
    }
    return 'Low Risk';
  }

  getRiskColor(level: RiskLevel): string {
    if (level === 'high') {
      return 'danger';
    }
    if (level === 'medium') {
      return 'warning';
    }
    return 'success';
  }

  getLoanRiskLevel(loan: Loan): RiskLevel {
    const levels = loan.items?.map(item => this.getItemRiskLevel(item.id)) ?? [];
    if (levels.includes('high')) {
      return 'high';
    }
    if (levels.includes('medium')) {
      return 'medium';
    }
    return 'low';
  }

  isHighRiskLoan(loan: Loan): boolean {
    return this.getLoanRiskLevel(loan) === 'high';
  }

  private mergeInventoryWithBase(items: InventoryItem[]): InventoryItem[] {
    const inventoryMap = new Map(items.map(item => [item.id, item.available]));
    const merged: InventoryItem[] = this.baseItems.map(item => ({
      id: item.id,
      available: inventoryMap.get(item.id) ?? 0
    }));

    items.forEach(item => {
      if (!this.baseItems.find(base => base.id === item.id)) {
        merged.push(item);
      }
    });

    return merged;
  }
}
