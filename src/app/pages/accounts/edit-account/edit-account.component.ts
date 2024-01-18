import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subscription, lastValueFrom, of,  } from 'rxjs';
import { Consumer, ConsumerService } from 'src/app/services/consumer.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss']
})
export class EditAccountComponent {
  headerData = {
    title: "Edit Consumer Info"
  }

  ConsumerInfoSubscription:Subscription;
  consumerInfo$:Observable<Consumer[]> = this.data.consumer_info;

  editConsumerForm:FormGroup;

  formData = {
    action: "Edit",
    consumerInfo: this.consumerInfo$
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    private formBuilder:FormBuilder,
    private consumerService:ConsumerService,
    private snackbarService:SnackbarService,
    private dialogRef: MatDialogRef<EditAccountComponent>,
    private sessionStorageService:SessionStorageServiceService,
    private router:Router,
  ) {}

  onEditAccountResponse(event:any) {
    if (event.status === "Consumer Info updated successfully") {
      this.dialogRef.close(event.consumerInfo);
    }
  }

  ngOnInit(): void {
    this.editConsumerForm = this.formBuilder.group({
      Consumer_id: ['', Validators.required],
      AccountNo: ['', Validators.required],
      Lastname: ['', Validators.required],
      Firstname: ['', Validators.required],
      Middlename: ['', Validators.required],
      ServiceAddress: ['', Validators.required],
      ContactNo: ['', Validators.required],
      Zone: ['', Validators.required],
      CustomerStatus: ['', Validators.required],
    });

    try {
      this.ConsumerInfoSubscription = this.consumerInfo$.subscribe(data => {
        for (const info of data) {
          this.editConsumerForm.patchValue(info);
        }
      });
    } catch(error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.log('Forbidden:', error.error);
          this.sessionStorageService.removeSession();
          this.router.navigate(['./authentication/login']);
        }
      }
    }

  }

  async updateConsumerAccount(formvalues:Consumer) {

    try {
      //console.log(formvalues);
      const res = await lastValueFrom(this.consumerService.updateConsumerInfo(formvalues));

      if (res.status === "Consumer Info updated successfully") {
        this.snackbarService.showSuccess(res.status);

        //this.dialogRef.close();
        this.consumerService.fetchConsumers().subscribe(data => {

          this.consumerService.dataSource.data = data;
          for (const consumerInfo of data) {
            if (consumerInfo.Consumer_id === this.editConsumerForm.get("Consumer_id")?.value) {
              this.consumerService.consumerInfo$ = of([consumerInfo]);
            }
          }
        });
        this.consumerService.loadConsumerSummary();
      } else {
        this.snackbarService.showError(res.status);
      }
    } catch(error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.log('Forbidden:', error.error);
          this.sessionStorageService.removeSession();
          this.router.navigate(['./authentication/login']);
        }
      }
    }



  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.ConsumerInfoSubscription.unsubscribe();
  }
}
