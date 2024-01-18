import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddChargesComponent } from 'src/app/components/add-charges/add-charges.component';
import { Charges, ChargesService } from 'src/app/services/charges.service';
import { EditChargesComponent } from '../edit-charges/edit-charges.component';
import { ConsumerService } from 'src/app/services/consumer.service';
import { MatPaginator } from '@angular/material/paginator';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionStorageServiceService } from 'src/app/services/session-storage-service.service';

@Component({
  selector: 'app-charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = [
    "ChargeID",
    "ChargeType",
    "Category",
    "Entry",
    "Particular",
    "Amount",
    // "ComputeRate",
  ];

  headerData = {
    title: `Charges`,
  };

  constructor(
    public chargesService:ChargesService,
    private dialog:MatDialog,
    private router:Router,
    private sessionStorageService:SessionStorageServiceService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.onLoadCharges();
  }

  async onLoadCharges() {

   try {
      const charges = await lastValueFrom(this.chargesService.loadCharges());
      console.log(charges);
      this.chargesService.dataSource = new MatTableDataSource(charges);
      this.chargesService.dataSource.paginator = this.paginator;
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

  onAddCharges() {
    const dialogRef = this.dialog.open(AddChargesComponent, {
      // panelClass: ['no-padding'],
      // data: {
      //   containerWidth: '800px',
      // }
    });
  }

  editChargeInfo(charge_id:string) {
    const dialogRef = this.dialog.open(EditChargesComponent, {
      // panelClass: ['no-padding'],
      data: {
        charge_id: charge_id
      }
    });
  }

}
