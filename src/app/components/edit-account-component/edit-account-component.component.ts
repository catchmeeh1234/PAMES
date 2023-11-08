import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, from, map, of,  } from 'rxjs';
import { Consumer, ConsumerService, RequestStatus } from 'src/app/services/consumer.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-edit-account-component',
  templateUrl: './edit-account-component.component.html',
  styleUrls: ['./edit-account-component.component.scss']
})
export class EditAccountComponentComponent {
  ConsumerInfoSubscription:Subscription;
  consumerInfo$:Observable<Consumer[]> = this.data.consumer_info;

  editConsumerForm:FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    private formBuilder:FormBuilder,
    private consumerService:ConsumerService,
    private snackbarService:SnackbarService,
    private dialogRef: MatDialogRef<EditAccountComponentComponent>,
  ) {}

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

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.ConsumerInfoSubscription = this.consumerInfo$.subscribe(data => {
      for (const info of data) {
        this.editConsumerForm.patchValue(info);
      }
    });
  }

  async updateConsumerAccount(formvalues:Consumer) {
    console.log(formvalues);
    const res = await this.consumerService.updateConsumerInfo(formvalues).toPromise();

    if (res?.status === undefined) {
      return;
    }

    if (res.status === "Consumer Info updated successfully") {
      this.snackbarService.showSuccess(res.status);
      this.dialogRef.close();
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

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.ConsumerInfoSubscription.unsubscribe();
  }
}
