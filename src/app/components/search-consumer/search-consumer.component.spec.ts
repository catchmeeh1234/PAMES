import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchConsumerComponent } from './search-consumer.component';

describe('SearchConsumerComponent', () => {
  let component: SearchConsumerComponent;
  let fixture: ComponentFixture<SearchConsumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchConsumerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchConsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
