import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Observable } from 'rxjs';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskInsight {
  itemId: string;
  pendingRequests: number;
  overlappingLoans: number;
  availableStock: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

interface LoanState {
  status: 'pending' | 'approved';
  dueDate: Date | null;
  items: Map<string, number>;
  itemsUnsub?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class LoanRiskService {
  private readonly overlapWindowDays = 14;
  private readonly weights = {
    pending: 1.3,
    overlap: 1.1,
    stock: 1.0
  };
  private readonly thresholds = {
    high: 6,
    medium: 3
  };

  watchRiskInsights(): Observable<RiskInsight[]> {
    return new Observable(observer => {
      const inventoryMap = new Map<string, number>();
      const loanStates = new Map<string, LoanState>();
      const teardownFns: Array<() => void> = [];

      const emitInsights = () => {
        observer.next(this.buildInsights(inventoryMap, loanStates));
      };

      const inventoryUnsub = firebase.firestore().collection('inventory').onSnapshot(snapshot => {
        inventoryMap.clear();
        snapshot.forEach(doc => {
          const available = Number(doc.data()?.['available'] ?? 0);
          inventoryMap.set(doc.id, Number.isFinite(available) ? available : 0);
        });
        emitInsights();
      });

      teardownFns.push(inventoryUnsub);

      const subscribeToLoans = (status: 'pending' | 'approved') => {
        const loansUnsub = firebase.firestore()
          .collection('loans')
          .where('status', '==', status)
          .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
              const id = change.doc.id;

              if (change.type === 'removed') {
                const existing = loanStates.get(id);
                if (existing?.itemsUnsub) {
                  existing.itemsUnsub();
                }
                loanStates.delete(id);
                return;
              }

              const data = change.doc.data();
              const dueDate = data?.['duedate']?.toDate ? data['duedate'].toDate() : null;
              let state = loanStates.get(id);

              if (!state) {
                state = { status, dueDate, items: new Map() };
                loanStates.set(id, state);
              } else {
                state.status = status;
                state.dueDate = dueDate;
              }

              if (!state.itemsUnsub) {
                state.itemsUnsub = firebase.firestore()
                  .collection(`loans/${id}/items`)
                  .onSnapshot(itemsSnapshot => {
                    state!.items.clear();
                    itemsSnapshot.forEach(itemDoc => {
                      const qty = Number(itemDoc.data()?.['quantity'] ?? 0);
                      if (Number.isFinite(qty) && qty > 0) {
                        state!.items.set(itemDoc.id, qty);
                      }
                    });
                    emitInsights();
                  });
              }
            });

            emitInsights();
          });

        teardownFns.push(loansUnsub);
      };

      subscribeToLoans('pending');
      subscribeToLoans('approved');

      return () => {
        teardownFns.forEach(fn => fn());
        loanStates.forEach(state => state.itemsUnsub?.());
      };
    });
  }

  private buildInsights(
    inventoryMap: Map<string, number>,
    loanStates: Map<string, LoanState>
  ): RiskInsight[] {
    const pendingCounts = new Map<string, number>();
    const overlapCounts = new Map<string, number>();
    const now = this.startOfToday();
    const overlapEnd = this.addDays(now, this.overlapWindowDays);

    loanStates.forEach(state => {
      if (state.items.size === 0) {
        return;
      }

      if (state.status === 'pending') {
        this.addItems(pendingCounts, state.items);
      }

      if (state.status === 'approved' && state.dueDate && this.isWithinRange(state.dueDate, now, overlapEnd)) {
        this.addItems(overlapCounts, state.items);
      }
    });

    const itemIds = new Set<string>();
    inventoryMap.forEach((_, key) => itemIds.add(key));
    pendingCounts.forEach((_, key) => itemIds.add(key));
    overlapCounts.forEach((_, key) => itemIds.add(key));

    const insights: RiskInsight[] = [];
    itemIds.forEach(itemId => {
      const pending = pendingCounts.get(itemId) ?? 0;
      const overlapping = overlapCounts.get(itemId) ?? 0;
      const available = inventoryMap.get(itemId) ?? 0;
      const riskScore = (pending * this.weights.pending)
        + (overlapping * this.weights.overlap)
        - (available * this.weights.stock);
      const riskLevel = this.getRiskLevel(riskScore);

      insights.push({
        itemId,
        pendingRequests: pending,
        overlappingLoans: overlapping,
        availableStock: available,
        riskScore,
        riskLevel
      });
    });

    return insights.sort((a, b) => {
      const rank = this.rankLevel(b.riskLevel) - this.rankLevel(a.riskLevel);
      if (rank !== 0) {
        return rank;
      }
      return b.riskScore - a.riskScore;
    });
  }

  private addItems(target: Map<string, number>, items: Map<string, number>) {
    items.forEach((qty, itemId) => {
      const next = (target.get(itemId) ?? 0) + qty;
      target.set(itemId, next);
    });
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= this.thresholds.high) {
      return 'high';
    }
    if (score >= this.thresholds.medium) {
      return 'medium';
    }
    return 'low';
  }

  private rankLevel(level: RiskLevel): number {
    if (level === 'high') {
      return 3;
    }
    if (level === 'medium') {
      return 2;
    }
    return 1;
  }

  private isWithinRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
}
