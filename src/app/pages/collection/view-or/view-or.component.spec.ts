import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrComponent } from './view-or.component';

describe('ViewOrComponent', () => {
  let component: ViewOrComponent;
  let fixture: ComponentFixture<ViewOrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewOrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
