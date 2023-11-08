import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccountComponentComponent } from './edit-account-component.component';

describe('EditAccountComponentComponent', () => {
  let component: EditAccountComponentComponent;
  let fixture: ComponentFixture<EditAccountComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAccountComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAccountComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
