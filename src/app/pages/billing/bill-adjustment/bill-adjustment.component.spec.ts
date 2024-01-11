import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillAdjustmentComponent } from './bill-adjustment.component';

describe('BillAdjustmentComponent', () => {
  let component: BillAdjustmentComponent;
  let fixture: ComponentFixture<BillAdjustmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillAdjustmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
