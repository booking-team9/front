import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../env/env";
import {Review} from "../model/review-model";

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private accommodationList: Review[] = [];


  constructor(private httpClient: HttpClient ) {
  }
  getAll(): Observable<Review[]>{
    return  this.httpClient.get<Review[]>(environment.apiHost + 'api/reviews/all')
  }
  findById(id: number): Observable<Review>{
    return this.httpClient.get<Review>(environment.apiHost + 'api/reviews/' + id)
  }
  findByAccommodationId(id: number): Observable<Review[]>{
    return this.httpClient.get<Review[]>(environment.apiHost + 'api/reviews/acc?accommodationId=' + id)
  }

  findByHostId(id: number): Observable<Review[]>{
    return this.httpClient.get<Review[]>(environment.apiHost + 'api/reviews/host?hostId=' + id)
  }
  saveNewReview(review: Review): Observable<Review>{
    return this.httpClient.post<Review>(environment.apiHost + 'api/reviews', review);
  }

  getUnapproved(): Observable<Review[]>{
    return this.httpClient.get<Review[]>(environment.apiHost + 'api/reviews/unapproved');
  }
  approveReview(id: number): Observable<Review>{
    return this.httpClient.patch<Review>(environment.apiHost + 'api/reviews/'+ id + '/approve', null);
  }
  deleteReview(id: number): Observable<any>{
    return this.httpClient.delete(environment.apiHost + 'api/reviews/' + id);
  }
  deleteHostReview(hostId: number, userId: number): Observable<any>{
    return this.httpClient.delete(environment.apiHost + 'api/reviews/deletehost/' +hostId + '/' + userId);
  }

  deleteAccommodationReview(accommodationId: number, userId: number): Observable<any>{
    return this.httpClient.delete(environment.apiHost + 'api/reviews/deleteacc/' +accommodationId + '/' + userId);
  }
  reportReview(reviewId: number): Observable<Review>{
    return this.httpClient.patch<Review>(environment.apiHost + 'api/reviews/' + reviewId + '/report', null);
  }

}
