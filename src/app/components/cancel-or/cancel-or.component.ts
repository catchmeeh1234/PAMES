import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateFormatService } from 'src/app/services/date-format.service';
import { CollectionDetails, OfficialReceiptService } from 'src/app/services/official-receipt.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UseraccountsService } from 'src/app/services/useraccounts.service';

@Component({
  selector: 'app-cancel-or',
  templateUrl: './cancel-or.component.html',
  styleUrls: ['./cancel-or.component.scss']
})
export class CancelOrComponent {
  headerData = {
    title: `Cancel OR`,
  };

  cancelORForm:FormGroup;
  orDetails:CollectionDetails;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder:FormBuilder,
    private sessionStorageService:SessionStorageServiceService,
    private userAccountsService:UseraccountsService,
    private snackbarService:SnackbarService,
    private dateFormatService:DateFormatService,
    private officialReceiptService:OfficialReceiptService,
    private dialogRef:MatDialogRef<CancelOrComponent>,
  ) {}

  async ngOnInit() {
    this.orDetails = this.data.orDetails;


    this.cancelORForm = this.formBuilder.group({
      CollectionID: ['', Validators.required],
      ReferenceNo: ['', Validators.required],
      CurrentDate: [new Date(), Validators.required],
      AccountNo: ['', Validators.required],
      AccountName: ['', Validators.required],
      CRNo: ['', Validators.required],
      TotalAmountDue: ['', Validators.required],
      Remarks: ['', Validators.required],
      CollectionStatus: ['', Validators.required],
      Username: [this.sessionStorageService.getSession("username"), Validators.required],
    });

    this.cancelORForm.get("CurrentDate")?.disable();

    this.cancelORForm.patchValue(this.orDetails);

    //get cancel cr reference number
    const cancelBillNo = await this.userAccountsService.fetchLogicNumbers("CancelCollection").toPromise();
    if (cancelBillNo && cancelBillNo.length === 1) {
      this.cancelORForm.patchValue({ReferenceNo: cancelBillNo[0].number});
      //console.log(this.cancelBillForm.value);
    }
  }

  async onSave(details:any) {
    if (details.Remarks === '') {
      this.snackbarService.showError("Please add a remarks");
      return;
    }

    const newDate = this.dateFormatService.formatDate(this.cancelORForm.get("CurrentDate")?.value);
    details.CurrentDate = newDate;
    const res:any = await this.officialReceiptService.cancelOR(details).toPromise();
    if (res.status === "OR Cancelled") {
      this.dialogRef.close(res.status);
    } else {
      this.snackbarService.showError(res.status);
    }
  }
}
