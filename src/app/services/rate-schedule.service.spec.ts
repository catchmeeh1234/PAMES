import { TestBed } from '@angular/core/testing';

import { RateScheduleService } from './rate-schedule.service';

describe('RateScheduleService', () => {
  let service: RateScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RateScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
