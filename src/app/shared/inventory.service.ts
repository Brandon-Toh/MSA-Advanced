import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Observable } from 'rxjs';

export interface InventoryItem {
  id: string;
  available: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryRef = firebase.firestore().collection('inventory');

  watchInventory(): Observable<InventoryItem[]> {
    return new Observable(observer => {
      const unsubscribe = this.inventoryRef.onSnapshot(snapshot => {
        const items: InventoryItem[] = [];
        snapshot.forEach(doc => {
          const available = Number(doc.data()?.['available'] ?? 0);
          items.push({
            id: doc.id,
            available: Number.isFinite(available) ? available : 0
          });
        });
        observer.next(items);
      });

      return () => unsubscribe();
    });
  }

  setAvailable(itemId: string, available: number) {
    return this.inventoryRef.doc(itemId).set({ available }, { merge: true });
  }
}
