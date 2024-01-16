import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { PasswordStatus, UseraccountsService } from 'src/app/services/useraccounts.service';


@Component({
  selector: 'app-password-prompt',
  templateUrl: './password-prompt.component.html',
  styleUrls: ['./password-prompt.component.scss']
})
export class PasswordPromptComponent {
  @ViewChild('input1') input1!: ElementRef<HTMLInputElement>;
  @ViewChild('input2') input2!: ElementRef<HTMLInputElement>;
  @ViewChild('input3') input3!: ElementRef<HTMLInputElement>;
  @ViewChild('input4') input4!: ElementRef<HTMLInputElement>;
  @ViewChild('input5') input5!: ElementRef<HTMLInputElement>;
  @ViewChild('input6') input6!: ElementRef<HTMLInputElement>;
  @ViewChild('submitButton') submitButton!: ElementRef<HTMLButtonElement>;

  public inputsFilled:boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef:MatDialogRef<PasswordPromptComponent>,
    private userAccountsService:UseraccountsService,
    private snackbarService:SnackbarService,
    private dialog:MatDialog,
  ) { }

  ngAfterViewInit(): void {
    const inputs: ElementRef<HTMLInputElement>[] = [
      this.input1,
      this.input2,
      this.input3,
      this.input4,
      this.input5,
      this.input6
    ];

    inputs.forEach(input => {
      this.addListener(input.nativeElement);
    });
  }

  ngOnInit(): void {
    // this.cancel_pr = new FormGroup({
    //   cancel_remarks: new FormControl(null, Validators.required),
    // });

  }

  addListener(input: HTMLInputElement): void {
    input.addEventListener('keyup', (event) => {
      const code = parseInt(input.value, 10);
      if (!isNaN(code) && code >= 0 && code <= 9) {
        const next = input.nextElementSibling as HTMLInputElement;
        if (next) next.focus();
      } else {
        input.value = '';
      }

      this.checkInputsAndFocusButton();

      const key = event.key;
      if (key === 'Backspace' || key === 'Delete') {
        const prev = input.previousElementSibling as HTMLInputElement;
        if (prev) prev.focus();
      }
    });
  }

  checkInputsAndFocusButton(): void {
    this.inputsFilled = [
      this.input1.nativeElement.value,
      this.input2.nativeElement.value,
      this.input3.nativeElement.value,
      this.input4.nativeElement.value,
      this.input5.nativeElement.value,
      this.input6.nativeElement.value
    ].every(value => value !== '');

    if (this.inputsFilled) {
      this.submitButton.nativeElement.focus();
    }
  }

  async submitPassword() {
    if (!this.inputsFilled) {
      this.snackbarService.showError("Please input admin password");
      return;
    }
    const password = `${this.input1.nativeElement.value}${this.input2.nativeElement.value}${this.input3.nativeElement.value}${this.input4.nativeElement.value}${this.input5.nativeElement.value}${this.input6.nativeElement.value}`;

    if (password === "") {
      return;
    }

    const res:any = await lastValueFrom(this.userAccountsService.validateAuthorizationPassword(password));
    const newRes:PasswordStatus = res;

    if (newRes.status === "access granted") {
      this.dialogRef.close(newRes);
    } else {
      this.snackbarService.showError(newRes.status);
      this.resetInput();
      if (this.input1 && this.input1.nativeElement) {
        // Focus on the input field
        this.input1.nativeElement.focus();
      }
    }
  }

  private resetInput() {
    this.input1.nativeElement.value = "";
    this.input2.nativeElement.value = "";
    this.input3.nativeElement.value = "";
    this.input4.nativeElement.value = "";
    this.input5.nativeElement.value = "";
    this.input6.nativeElement.value = "";

    this.inputsFilled = false;
  }
}
