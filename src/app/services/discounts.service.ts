import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Discount {
  DiscountID: string
  DiscountName: string
  DiscountPercent: number
  DiscountLimit: number
}

@Injectable({
  providedIn: 'root'
})
export class DiscountsService {

  constructor(
    private http:HttpClient,
  ) { }

  loadDiscounts(discount_name:string) {
    return this.http.get<Discount[]>(`${environment.API_URL}/Discounts/loadDiscounts.php?discount_name=${discount_name}`);
  }
}
