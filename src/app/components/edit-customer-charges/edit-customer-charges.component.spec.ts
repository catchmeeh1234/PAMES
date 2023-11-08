import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomerChargesComponent } from './edit-customer-charges.component';

describe('EditCustomerChargesComponent', () => {
  let component: EditCustomerChargesComponent;
  let fixture: ComponentFixture<EditCustomerChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCustomerChargesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCustomerChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
