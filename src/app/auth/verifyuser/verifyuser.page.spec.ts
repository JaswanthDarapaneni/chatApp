import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyuserPage } from './verifyuser.page';

describe('VerifyuserPage', () => {
  let component: VerifyuserPage;
  let fixture: ComponentFixture<VerifyuserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyuserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
