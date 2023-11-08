import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormChargesComponent } from './form-charges.component';

describe('FormChargesComponent', () => {
  let component: FormChargesComponent;
  let fixture: ComponentFixture<FormChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormChargesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
