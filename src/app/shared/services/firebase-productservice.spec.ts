import { TestBed } from '@angular/core/testing';

import { FirebaseProductservice } from './firebase-productservice';

describe('FirebaseProductservice', () => {
  let service: FirebaseProductservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseProductservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
