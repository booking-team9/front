import { TestBed } from '@angular/core/testing';

import { ReservationService } from './reservation.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {
  mockReservation1
} from '../mocks/reservation.service.mock';
import {environment} from "../../env/env";

describe('ReservationService', () => {
  let service: ReservationService;
  let httpController: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ReservationService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call createReservation and the API should return the reservation that was created', () => {
    service.createReservation(mockReservation1).subscribe((data) => {
      expect(data).toEqual(mockReservation1);
    });

    const req = httpController.expectOne({
      method: 'POST',
      url: environment.apiHost + 'api/reservations',
    });

    req.flush(mockReservation1);
  })
});
