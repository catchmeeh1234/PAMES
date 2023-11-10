import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBillsComponent } from './create-bills/create-bills.component';
import { BillsComponent } from './bills/bills.component';
import { CreateSingleBillComponent } from './create-single-bill/create-single-bill.component';
import { BillInfoComponent } from './bill-info/bill-info.component';
import { EditBillComponent } from './edit-bill/edit-bill.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'bills',
        component: BillsComponent,
      },
      {
        path: 'create-bills',
        component: CreateBillsComponent,
      },
      {
        path: 'create-bill',
        component: CreateSingleBillComponent,
      },
      {
        path: 'edit-bill/:bill_no',
        component: EditBillComponent,
      },
      {
        path: 'bill-info/:bill_no',
        component: BillInfoComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
