import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ChargeType, Charges, ChargesService } from 'src/app/services/charges.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-form-charges',
  templateUrl: './form-charges.component.html',
  styleUrls: ['./form-charges.component.scss']
})
export class FormChargesComponent {
  @Input() formData: any;
  @Output() status = new EventEmitter<Charges>();

  chargeType:ChargeType;

  chargesForm:FormGroup;

  constructor(
    private formBuilder:FormBuilder,
    private chargesService:ChargesService,
    private snackbarService:SnackbarService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
      this.chargesForm = this.formBuilder.group({
        ChargeID: ['Fixed'],
        ChargeType: ['', Validators.required],
        Category: ['', Validators.required],
        Entry: ['', Validators.required],
        Particular: ['', Validators.required],
        Amount: ["0.00", [ Validators.pattern('^[0-9]*(\.[0-9]{1,2})?$')]],
        ComputeRate: ["0.00", [Validators.pattern('^[0-9]*(\.[0-9]{1,2})?$')]]
      });
      if (this.formData) {
        this.chargesForm.patchValue(this.formData);
        this.chargeType = this.chargesForm.get("ChargeType")?.value;
      }
  }

  async onSaveCharges(chargesInfo:Charges) {

    if (this.chargesForm.get("Amount")?.value === "0.00" && this.chargesForm.get("ChargeType")?.value === "Fixed") {
      return;
    }

    if (this.chargesForm.get("ComputeRate")?.value === "0.00" && (this.chargesForm.get("ChargeType")?.value === "Amount Percentage" ||
          this.chargesForm.get("ChargeType")?.value === "Cons. Rate")) {
      return;
    }

    //console.log(this.chargesForm.valid, this.chargesForm);
    if (this.chargesForm.valid) {
      //console.log(chargesInfo);
      this.status.emit(chargesInfo);
    }

  }

  onSelectChange(event: MatSelectChange) {
    console.log(event);
    if (event.value === "Fixed") {
      this.chargesForm.get("ComputeRate")?.setValue("0.00");
    } else {
      this.chargesForm.get("Amount")?.setValue("0.00");
    }
    this.chargeType = event.value;
  }

}
