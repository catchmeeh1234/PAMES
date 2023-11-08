import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomerChargesComponent } from './add-customer-charges.component';

describe('AddCustomerChargesComponent', () => {
  let component: AddCustomerChargesComponent;
  let fixture: ComponentFixture<AddCustomerChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCustomerChargesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCustomerChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
