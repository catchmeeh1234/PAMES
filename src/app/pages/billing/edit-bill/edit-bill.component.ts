import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BillInfo, BillService } from 'src/app/services/bill.service';

interface FormData {
  action: string
  billInfo: BillInfo | null
}

@Component({
  selector: 'app-edit-bill',
  templateUrl: './edit-bill.component.html',
  styleUrls: ['./edit-bill.component.scss']
})
export class EditBillComponent {
  headerData = {
    title: "Edit bill",
    url: './billing/bills'
  };

  bill_number = this.route.snapshot.params['bill_no'];

  formData:any = {
    action: 'Edit',
    bill_no: this.bill_number
  }

  constructor(
    private route:ActivatedRoute,
    private billService:BillService,
  ) {}

  async ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // const bill_no = this.route.snapshot.params['bill_no'];
    // const billInfo = await this.billService.fetchBillByBillNo(bill_no).toPromise();
    // if (billInfo) {
    //   this.formData.billInfo = billInfo[0];
    //   console.log(this.formData);

    // }
    console.log(this.formData);

  }
}
