import { TestBed } from '@angular/core/testing';

import { SessionStorageServiceService } from './session-storage-service.service';

describe('SessionStorageServiceService', () => {
  let service: SessionStorageServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
