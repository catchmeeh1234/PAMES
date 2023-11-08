import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ChargeType, Charges, ChargesService } from 'src/app/services/charges.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-add-charges',
  templateUrl: './add-charges.component.html',
  styleUrls: ['./add-charges.component.scss']
})
export class AddChargesComponent {
  chargeType:ChargeType = "Fixed";

  addChargesForm:FormGroup;

  constructor(
    private formBuilder:FormBuilder,
    private chargesService:ChargesService,
    private dialogRef: MatDialogRef<AddChargesComponent>,
    private snackbarService:SnackbarService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }


  async onSave(chargesInfo:Charges) {
    const res:any = await this.chargesService.addCharges(chargesInfo).toPromise();
      if (res.status === "Charges Added") {
        this.snackbarService.showSuccess(res.status);

        this.chargesService.loadCharges().subscribe(data => {
          this.chargesService.dataSource.data = data;
        });
        this.dialogRef.close();
      } else {
        this.snackbarService.showError(res.status);
      }
  }

}
