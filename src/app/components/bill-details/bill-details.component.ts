import { Component, Input } from '@angular/core';
import { BillInfo } from 'src/app/services/bill.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bill-details',
  templateUrl: './bill-details.component.html',
  styleUrls: ['./bill-details.component.scss']
})
export class BillDetailsComponent {
  @Input() billDetails: BillInfo | null;

  companyName = environment.COMPANY_NAME;
  companyAddress1 = environment.COMPANY_ADDRESS1;
  companyAddress2 = environment.COMPANY_ADDRESS2;


  get billAmountDue() {
    if (this.billDetails) {
      const amountDue = parseFloat(this.billDetails.AmountDue) - parseFloat(this.billDetails.SeniorDiscount);
      return amountDue.toFixed(2);
    } else {
      return "0";
    }
  }
}
