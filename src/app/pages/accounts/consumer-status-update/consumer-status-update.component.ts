import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, first, map } from 'rxjs';
import { AccountStatus, Consumer, ConsumerService } from 'src/app/services/consumer.service';
import { DateFormatService } from 'src/app/services/date-format.service';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-consumer-status-update',
  templateUrl: './consumer-status-update.component.html',
  styleUrls: ['./consumer-status-update.component.scss']
})
export class ConsumerStatusUpdateComponent {
  headerData = {
    title: "Update Consumer Status",
    url: "./accounts/manage-accounts"
  };

  showInput = false;

  customerStatuses = ["Active", "Disconnected"];
  disconnectionTypes = ["Voluntary", "Involuntary"];
  meterStatuses = ["Pulled out", "Locked", "Permanent"];

  displayedColumns = [
    "date","customerStatus","discType","meterStatus",
    "lastReading","remarks","performedBy","updatedBy",
  ];
  dataSource:MatTableDataSource<AccountStatus>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  accountStatusForm:FormGroup;
  errorMessage:string[] = [];

  private username:string = "";
  consumerInfo$:Observable<Consumer>;


  constructor(
    private formBuilder:FormBuilder,
    private sessionStorageService:SessionStorageServiceService,
    private route: ActivatedRoute,
    private consumerService:ConsumerService,
    private dateFormatService:DateFormatService,
    private snackbarService:SnackbarService,
    private router:Router,
  ) {}

  ngOnInit(): void {
    const accountNo = this.route.snapshot.params['accountNo'];

    this.username = this.sessionStorageService.getSession("username")!;

    this.accountStatusForm = this.formBuilder.group({
      date: [new Date(), Validators.required],
      customerStatus: ['', Validators.required],
      discType: ['', Validators.required],
      meterStatus: ['', Validators.required],
      performedBy: ['', [Validators.required]],
      lastReading: ['', [Validators.required, this.numberValidator]],
      remarks: ['', [Validators.required]],
      username: [this.username, Validators.required],
      accountNo: [accountNo, Validators.required]
    });

    this.accountStatusForm.get("customerStatus")?.valueChanges
    .subscribe((customerStatus:string) => {

      if (customerStatus === "Active") {
        this.accountStatusForm.get("discType")?.clearValidators();
        this.accountStatusForm.get('discType')?.updateValueAndValidity();

        this.accountStatusForm.get("meterStatus")?.clearValidators();
        this.accountStatusForm.get('meterStatus')?.updateValueAndValidity();

        this.accountStatusForm.get("performedBy")?.clearValidators();
        this.accountStatusForm.get('performedBy')?.updateValueAndValidity();

        this.accountStatusForm.get("lastReading")?.clearValidators();
        this.accountStatusForm.get('lastReading')?.updateValueAndValidity();

        this.showInput = false;
      } else {
        this.accountStatusForm.get("discType")?.setValidators(Validators.required);
        this.accountStatusForm.get('discType')?.updateValueAndValidity();

        this.accountStatusForm.get("meterStatus")?.setValidators(Validators.required);
        this.accountStatusForm.get('meterStatus')?.updateValueAndValidity();

        this.accountStatusForm.get("performedBy")?.setValidators(Validators.required);
        this.accountStatusForm.get('performedBy')?.updateValueAndValidity();

        this.accountStatusForm.get("lastReading")?.setValidators([Validators.required, this.numberValidator]);
        this.accountStatusForm.get('lastReading')?.updateValueAndValidity();

        this.showInput = true;
      }
    });

    this.loadAccountStatusTable(accountNo);

     this.consumerInfo$ = this.consumerService.fetchConsumerInfoByAccNo(accountNo)
     .pipe(
      first(),
      map(consumer => {
        const fullname = `${consumer.Firstname} ${consumer.Middlename} ${consumer.Lastname}`;
        return {...consumer, Fullname: fullname};
      }),

      );

     this.consumerInfo$.subscribe(data => {
      console.log(data);

     })
  }

  get accountNumber() {
    return this.accountStatusForm.get("accountNo")?.value;
  }

  openConsumerInfo(consumerId:string) {
    console.log(consumerId);

    this.router.navigate(['./accounts/view-account/', consumerId])
  }

  //CUSTOM FORM VALIDATORS
  numberValidator(control: AbstractControl): { [key: string]: any } | null {
    const valid = /^\d+$/.test(control.value);

    if (!valid) {
      return { onlyNumbers: true };
    }
    return null;
  }

  loadAccountStatusTable(accountNo:string) {
    this.consumerService.fetchAccountStatusTable(accountNo)
    .subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
    });
  }



  onUpdate() {
    const discType = this.accountStatusForm.get('discType')?.value;
    const meterStatus = this.accountStatusForm.get('meterStatus')?.value;
    const customerStatus = this.accountStatusForm.get('customerStatus')?.value;

    if (customerStatus === "Disconnected") {
      if (discType === "" || meterStatus === "") {
        this.snackbarService.showError("Please provide a disconnection type and a meter status");
        return;
      }
    }


    const formData = this.accountStatusForm.value;
    const date = formData.date;
    const newDate = this.dateFormatService.formatDate(date);
    formData.date = newDate;

    this.consumerService.updateAccountStatus(formData)
    .subscribe(result => {
      if (result.status === "Account status updated") {
        const accountNumber = formData.accountNo;

        this.snackbarService.showSuccess(result.status);
        this.loadAccountStatusTable(accountNumber);
      } else {
        this.snackbarService.showError(result.status)
      }
    });
  }

}
