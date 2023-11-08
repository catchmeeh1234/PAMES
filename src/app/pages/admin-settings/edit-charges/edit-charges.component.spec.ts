import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChargesComponent } from './edit-charges.component';

describe('EditChargesComponent', () => {
  let component: EditChargesComponent;
  let fixture: ComponentFixture<EditChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditChargesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
