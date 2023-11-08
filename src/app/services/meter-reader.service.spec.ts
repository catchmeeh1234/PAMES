import { TestBed } from '@angular/core/testing';

import { MeterReaderService } from './meter-reader.service';

describe('MeterReaderService', () => {
  let service: MeterReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeterReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
