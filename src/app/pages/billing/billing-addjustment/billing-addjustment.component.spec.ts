import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingAddjustmentComponent } from './billing-addjustment.component';

describe('BillingAddjustmentComponent', () => {
  let component: BillingAddjustmentComponent;
  let fixture: ComponentFixture<BillingAddjustmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingAddjustmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingAddjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
