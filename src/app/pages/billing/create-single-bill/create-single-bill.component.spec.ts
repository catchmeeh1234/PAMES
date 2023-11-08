import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSingleBillComponent } from './create-single-bill.component';

describe('CreateSingleBillComponent', () => {
  let component: CreateSingleBillComponent;
  let fixture: ComponentFixture<CreateSingleBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSingleBillComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSingleBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
