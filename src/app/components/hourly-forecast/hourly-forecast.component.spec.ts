import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlyForecast } from './hourly-forecast.component';

describe('HourlyForecast', () => {
  let component: HourlyForecast;
  let fixture: ComponentFixture<HourlyForecast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourlyForecast],
    }).compileComponents();

    fixture = TestBed.createComponent(HourlyForecast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
