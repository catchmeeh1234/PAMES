import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCustomerChargesComponent } from './manage-customer-charges.component';

describe('ManageCustomerChargesComponent', () => {
  let component: ManageCustomerChargesComponent;
  let fixture: ComponentFixture<ManageCustomerChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCustomerChargesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCustomerChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
