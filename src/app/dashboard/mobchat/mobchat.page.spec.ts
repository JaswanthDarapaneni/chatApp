import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobchatPage } from './mobchat.page';

describe('MobchatPage', () => {
  let component: MobchatPage;
  let fixture: ComponentFixture<MobchatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MobchatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
