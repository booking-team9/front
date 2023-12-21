import {Component, Input, OnInit, ViewChild} from '@angular/core';
import accommodationData from '../accommodation-data.json';
import {Accommodation} from '../../model/accommodation-model';
import {Address} from 'src/app/model/address-model';
import {Review} from '../../model/review-model';
import {ActivatedRoute, Router} from "@angular/router";
import {AccommodationService} from "../accommodation.service";
import {ReviewService} from "../../reviews/review.service";
import {PhotoService} from "../../shared/photo.service";
import {Host} from "../../model/host-model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {Timeslot} from "../../model/timeslot-model";
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from 'src/app/reservations/reservation.service';
import { New_reservation } from 'src/app/model/new_reservation-model';
import { ReservationStatus } from 'src/app/model/ReservationStatus';
import { GuestService } from 'src/app/accounts/services/guest.service';
import { Email } from 'src/app/model/Email';
import { Guest } from 'src/app/model/guest-model';


interface Image{
  url: SafeUrl;
  thumbnail: string;
}
const emptyHost: Host = {
  firstName: "",
  lastName: "",
  phone: "",
  address: {
    street: "",
    city: "",
    number: "",
    country: "",
  },
  properties: [],
  hostReviews: [],
  id: undefined,
  email: "",
  isBlocked: false,
  profilePictureUrl: "",
  password: ""
};
const emptyAccommodation: Accommodation = {
  id: 0,
  name: "",
  description: "",
  amenities: [],
  maxGuests: 0,
  minGuests: 0,
  photos: [],
  pricePerGuest: false,
  cancellationDeadline: 0,
  autoApproval: false,
  averageGrade: 0,
  reviews: [],
  roomNumber: 0,
  address: {street: "", number: "", city: "", country: ""},
  host: emptyHost,
  availability: [],
  accommodationType: "",
  status: 0
}
@Component({
  selector: 'app-accommodation-details',
  templateUrl: './accommodation-details.component.html',
  styleUrls: ['./accommodation-details.component.css']
})



export class AccommodationDetailsComponent implements OnInit {
  isGuest: boolean = this.authService.getRole() == "ROLE_Guest";
  accommodation: Accommodation = emptyAccommodation;
  hostName: string
  images: Image[] = [];
  imagesAreLoaded: boolean = false;
   responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
  accommodationLoaded: boolean = false;
  reviewsLoaded: boolean = false;

  reservation_form: FormGroup;
  totalPrice: number;
  pricePerNight: number;

  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private accommodationService: AccommodationService, private reviewService: ReviewService, private photoService: PhotoService, private authService: AuthService, private reservationService: ReservationService, private guestService: GuestService, private router: Router) {}

  ngOnInit() {
    console.log(this.accommodation.maxGuests + " " + this.accommodation.minGuests)
    this.reservation_form = new FormGroup({
      startDate: new FormControl('', [Validators.required, this.validateDateRange.bind(this)]),
      endDate: new FormControl('', [Validators.required, this.validateDateRange.bind(this)]),
      guests: new FormControl('', [Validators.required]),
    });

    this.route.params.subscribe((params) => {
      const id = +params['accommodationId']
      this.accommodationService.findById(id).subscribe({
        next: (data: Accommodation) => {
          this.accommodation = data
          this.accommodationLoaded = true;
          
          this.reservation_form.get('guests')?.setValidators([
            Validators.required,
            Validators.min(this.accommodation.minGuests),
            Validators.max(this.accommodation.maxGuests)
          ]);
          this.reservation_form.get('guests')?.updateValueAndValidity();

          for (let i =0; i<this.accommodation.photos.length; i++){
            this.photoService.getImage(this.accommodation.photos[i]).subscribe({
              next: value => {
                let objectURL = URL.createObjectURL(value);
                this.images.push({url: this.sanitizer.bypassSecurityTrustUrl(objectURL), thumbnail:""});
                if (this.images.length === this.accommodation.photos.length){
                  this.imagesAreLoaded = true
                }
              }
            })
          }
          
          if(this.isGuest) {
            // info about searched dates and guest number
            this.accommodationService.getSearchedAccommodationDetails().subscribe((searchDetails) => {
              if(searchDetails) {
                this.totalPrice = searchDetails.totalPrice;
                this.pricePerNight = searchDetails.pricePerNight;
              }
            })

            // info about prices
            this.accommodationService.getFilteredAccommodationDetails().subscribe((filterDetails) => {
              if(filterDetails) {
                console.log(JSON.stringify(filterDetails));
                this.reservation_form.patchValue({
                  startDate: filterDetails.startDate,
                  endDate: filterDetails.endDate,
                  guests: filterDetails.guests
                })
              }
            })
          }

          
          this.hostName = this.accommodation.host.firstName +" "+  this.accommodation.host.lastName;
          this.reviewService.findByAccommodationId(this.accommodation.id).subscribe({
            next: (data: Review[]) => {
              this.accommodation.reviews = data
              this.reviewsLoaded = true;
            }
          })

        }
      })


    })

  }


  get stars() {
    return Array(Math.floor(this.accommodation.averageGrade)).fill(0);
  }

  getPhotoURI(): string[] {
    return this.accommodation.photos.map(element => '../../../../../assets/' + element)
  }


  validateDateRange(control: AbstractControl): { [key: string]: boolean } | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
  
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
  
      const currentDate = new Date(); 
  
      // one in past
      if (startDateObj <= currentDate || endDateObj <= currentDate) {
        return { 'invalidDateRange': true, 'pastDate': true };
      }
  
      // end after start
      if (endDateObj <= startDateObj) {
        return { 'invalidDateRange': true, 'endDateBeforeStartDate': true };
      }
    }
    return null;
  }
  

  onSubmit(): void {
    if (this.reservation_form.valid) {
      const userEmail = this.authService.getEmail();
  
      if (userEmail !== null) {
        const emailObj: Email = { email: userEmail };
  
        this.guestService.findByEmail(emailObj).subscribe(
          (user: Guest) => {
            if (this.reservation_form.valid) {
              const { startDate, endDate, guests } = this.reservation_form.value;  
              const newReservation: New_reservation = {
                startDate,
                days: Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)),
                price: this.totalPrice,
                reservationStatus: this.accommodation.autoApproval ? ReservationStatus.Approved : ReservationStatus.Pending,
                accommodationId: this.accommodation.id,
                guest: user,
                numberOfGuests: guests
              };
  
              // creating reservation
              this.reservationService.createReservation(newReservation).subscribe(
                (reservationData: any) => {
                  alert('Reservation created successfully')
                  this.router.navigate([''])
                },
                (error: any) => {
                  console.error('Error creating reservation:', error);
                  alert('An error occurred')
                }
              ); 
            }
          },
          (error) => {
            console.error('Error fetching data:', error);
            alert('An error occurred')
          }
        );
      }
    } else {
      console.error('Form is invalid. Please check your inputs.');
      // print all invalid fields in the console
      this.reservation_form.markAllAsTouched();
      for (const key of Object.keys(this.reservation_form.controls)) {
        if (this.reservation_form.controls[key].invalid)
          console.log(`${key}:`, this.reservation_form.controls[key].errors);
      }
    }
  }
}
  