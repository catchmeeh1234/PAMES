import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostOrComponent } from './post-or.component';

describe('PostOrComponent', () => {
  let component: PostOrComponent;
  let fixture: ComponentFixture<PostOrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostOrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostOrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
