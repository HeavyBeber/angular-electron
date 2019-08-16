import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewClientDialogComponent } from './create-new-client-dialog.component';

describe('CreateNewClientDialogComponent', () => {
  let component: CreateNewClientDialogComponent;
  let fixture: ComponentFixture<CreateNewClientDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewClientDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewClientDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
