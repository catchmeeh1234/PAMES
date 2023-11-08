import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChargesComponent } from './charges/charges.component';
import { ManageCustomerChargesComponent } from './manage-customer-charges/manage-customer-charges.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'charges',
        component: ChargesComponent,
      },
      {
        path: 'manage-consumer-charges/:consumer_id',
        component: ManageCustomerChargesComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSettingsRoutingModule { }
