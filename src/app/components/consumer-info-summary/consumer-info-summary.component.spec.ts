import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumerInfoSummaryComponent } from './consumer-info-summary.component';

describe('ConsumerInfoSummaryComponent', () => {
  let component: ConsumerInfoSummaryComponent;
  let fixture: ComponentFixture<ConsumerInfoSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumerInfoSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumerInfoSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
