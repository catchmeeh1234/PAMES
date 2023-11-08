import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'app-confirmation-prompt',
  templateUrl: './confirmation-prompt.component.html',
  styleUrls: ['./confirmation-prompt.component.scss']
})
export class ConfirmationPromptComponent {

  public statusColor:string;
  public cancel_pr: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef:MatDialogRef<ConfirmationPromptComponent>,
  ) { }

  ngOnInit(): void {
    // this.cancel_pr = new FormGroup({
    //   cancel_remarks: new FormControl(null, Validators.required),
    // });
  }

  onConfirm() {
    this.dialogRef.close('yes');
  }

  onCancel() {
    this.dialogRef.close('no');
  }
}
