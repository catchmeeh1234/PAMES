import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumerStatusUpdateComponent } from './consumer-status-update.component';

describe('ConsumerStatusUpdateComponent', () => {
  let component: ConsumerStatusUpdateComponent;
  let fixture: ComponentFixture<ConsumerStatusUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumerStatusUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumerStatusUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
