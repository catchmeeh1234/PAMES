import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrComponent } from './create-or.component';

describe('CreateOrComponent', () => {
  let component: CreateOrComponent;
  let fixture: ComponentFixture<CreateOrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
