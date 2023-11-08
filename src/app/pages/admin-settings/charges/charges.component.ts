import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddChargesComponent } from 'src/app/components/add-charges/add-charges.component';
import { Charges, ChargesService } from 'src/app/services/charges.service';
import { EditChargesComponent } from '../edit-charges/edit-charges.component';
import { ConsumerService } from 'src/app/services/consumer.service';
import { MatPaginator } from '@angular/material/paginator';

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


  constructor(
    public chargesService:ChargesService,
    private dialog:MatDialog,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.onLoadCharges();
  }

  async onLoadCharges() {
   const charges = await this.chargesService.loadCharges().toPromise();
   console.log(charges);
    this.chargesService.dataSource = new MatTableDataSource(charges);
    this.chargesService.dataSource.paginator = this.paginator;
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
