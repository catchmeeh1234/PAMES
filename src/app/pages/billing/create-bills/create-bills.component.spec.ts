import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillsComponent } from './create-bills.component';

describe('CreateBillsComponent', () => {
  let component: CreateBillsComponent;
  let fixture: ComponentFixture<CreateBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
