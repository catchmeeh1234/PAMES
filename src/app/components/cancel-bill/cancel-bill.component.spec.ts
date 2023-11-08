import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelBillComponent } from './cancel-bill.component';

describe('CancelBillComponent', () => {
  let component: CancelBillComponent;
  let fixture: ComponentFixture<CancelBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelBillComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
