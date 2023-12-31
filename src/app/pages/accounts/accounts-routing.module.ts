import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ManageAccountsComponent } from './manage-accounts/manage-accounts.component';
import { ConsumerInfoComponent } from './consumer-info/consumer-info.component';
import { ConsumerStatusUpdateComponent } from './consumer-status-update/consumer-status-update.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create-account',
        component: CreateAccountComponent,
      },
      {
        path: 'view-account/:consumer_id',
        component: ConsumerInfoComponent,
      },
      {
        path: 'manage-accounts',
        component: ManageAccountsComponent,
      },
      {
        path: 'update-account-status/:accountNo',
        component: ConsumerStatusUpdateComponent,
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
