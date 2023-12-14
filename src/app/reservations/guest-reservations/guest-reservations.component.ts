import {Component, OnInit} from '@angular/core';
import {Reservation} from "../../model/reservation-model";
import {SelectItem} from "primeng/api";
import {ActivatedRoute} from "@angular/router";
import {ReservationService} from "../reservation.service";
import {Table} from "primeng/table";
import {toNumbers} from "@angular/compiler-cli/src/version_helpers";

@Component({
  selector: 'app-guest-reservations',
  templateUrl: './guest-reservations.component.html',
  styleUrls: ['./guest-reservations.component.css']
})
export class GuestReservationsComponent implements OnInit{
  reservations: Reservation[];
  loading: boolean = true;
  filteredReservations: Reservation[];
  selectedStatus: string = '';
  statusOptions: SelectItem[] = [
    { label: 'All', value: null },
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Denied', value: 'Denied' },
    { label: 'Active', value: 'Active' },
    { label: 'Done', value: 'Done' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  constructor(private route: ActivatedRoute, private reservationService: ReservationService) {
  }
  clear(table: Table){
    table.clear();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params)=>{
      this.reservationService.getAll().subscribe({
        next: (data: Reservation[]) =>{
          data.forEach((reservation)=>{
            // @ts-ignore
            let numbers: number[] = reservation.startDate as number[];
            reservation.startDate=new Date(numbers[0],numbers[1],numbers[2], numbers[3], numbers[4]);
            // @ts-ignore
            numbers = reservation.endDate as number[];
            reservation.endDate=new Date(numbers[0],numbers[1],numbers[2], numbers[3], numbers[4]);
          })
          this.reservations=data;
          this.filteredReservations=data;
          this.loading=false;
        }
      })
    })
  }

  cancelReservation(id: number) {
    const isConfirmed = window.confirm('Are you sure you want to cancel this reservation?');
    if (isConfirmed){
      this.reservationService.cancelReservation(id).subscribe(
          () => {
            console.log('Reservation canceled successfully');
            alert('Reservation canceled successfully');
            this.refresh();
            // You can perform additional actions after approval if needed
          },
          (error) => {
            console.error('Failed to cancel reservation:', error);
            alert('Failed to cancel reservation');
          });
    }

  }

  refresh() {
    this.loading = true; // Optional: Set loading to true while fetching new data
    this.reservationService.getAll().subscribe({
      next: (data: Reservation[]) => {
        data.forEach((reservation)=>{
          // @ts-ignore
          let numbers: number[] = reservation.startDate as number[];
          reservation.startDate=new Date(numbers[0],numbers[1],numbers[2], numbers[3], numbers[4]);
          // @ts-ignore
          numbers = reservation.endDate as number[];
          reservation.endDate=new Date(numbers[0],numbers[1],numbers[2], numbers[3], numbers[4]);
        })
        this.reservations = data;
        this.filteredReservations=data;
        this.loading = false; // Optional: Set loading to false after data is fetched
      },
      error: (error) => {
        console.error('Failed to refresh reservations:', error);
        this.loading = false; // Optional: Set loading to false on error
      }
    });
  }

  filterReservations(): void {
    if (!this.selectedStatus) {
      this.filteredReservations = this.reservations;
    } else {
      this.filteredReservations = this.reservations.filter(reservation => reservation.reservationStatus.toString() == this.selectedStatus);
    }
  }

}