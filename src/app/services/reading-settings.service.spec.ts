import { TestBed } from '@angular/core/testing';

import { ReadingSettingsService } from './reading-settings.service';

describe('ReadingSettingsService', () => {
  let service: ReadingSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadingSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
