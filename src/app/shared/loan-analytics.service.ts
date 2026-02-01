import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Observable } from 'rxjs';

export interface HeatmapState {
  counts: number[][];
  total: number;
  max: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoanAnalyticsService {
  private readonly slotIndexByKey: Record<string, number> = {
    morning: 0,
    afternoon: 1,
    evening: 2
  };

  watchHeatmap(): Observable<HeatmapState> {
    return new Observable(observer => {
      const counts = this.createEmptyCounts();
      const docBuckets = new Map<string, { dayIndex: number; slotIndex: number }>();

      const collectionRef: any = firebase.firestore().collection('loans');
      const queryRef = typeof collectionRef.select === 'function'
        ? collectionRef.select('dayIndex', 'timeSlot')
        : collectionRef;

      const unsubscribe = queryRef.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          const id = change.doc.id;
          const previous = docBuckets.get(id);
          if (previous) {
            this.adjustCount(counts, previous.dayIndex, previous.slotIndex, -1);
          }

          if (change.type !== 'removed') {
            const next = this.extractBucket(change.doc.data());
            if (next) {
              docBuckets.set(id, next);
              this.adjustCount(counts, next.dayIndex, next.slotIndex, 1);
            } else {
              docBuckets.delete(id);
            }
          } else {
            docBuckets.delete(id);
          }
        });

        observer.next(this.buildState(counts));
      });

      return () => unsubscribe();
    });
  }

  private createEmptyCounts(): number[][] {
    return Array.from({ length: 7 }, () => [0, 0, 0]);
  }

  private extractBucket(data: any): { dayIndex: number; slotIndex: number } | null {
    const dayIndex = Number(data?.dayIndex);
    const timeSlot = String(data?.timeSlot ?? '').toLowerCase();
    const slotIndex = this.slotIndexByKey[timeSlot];

    if (Number.isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6 || slotIndex === undefined) {
      return null;
    }

    return { dayIndex, slotIndex };
  }

  private adjustCount(counts: number[][], dayIndex: number, slotIndex: number, delta: number) {
    const next = (counts[dayIndex]?.[slotIndex] ?? 0) + delta;
    counts[dayIndex][slotIndex] = Math.max(0, next);
  }

  private buildState(counts: number[][]): HeatmapState {
    let total = 0;
    let max = 0;

    for (let row = 0; row < counts.length; row += 1) {
      for (let col = 0; col < counts[row].length; col += 1) {
        const value = counts[row][col];
        total += value;
        if (value > max) {
          max = value;
        }
      }
    }

    const clonedCounts = counts.map(row => row.slice());
    return { counts: clonedCounts, total, max };
  }
}
