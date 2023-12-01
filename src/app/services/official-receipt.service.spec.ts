import { TestBed } from '@angular/core/testing';

import { OfficialReceiptService } from './official-receipt.service';

describe('OfficialReceiptService', () => {
  let service: OfficialReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficialReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
