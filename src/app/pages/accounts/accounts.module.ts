import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ExtraRoutes } from '../extra/extra.routing';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ManageAccountsComponent } from './manage-accounts/manage-accounts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
import { ComponentsModule } from 'src/app/components/components.module';
import { ConsumerInfoComponent } from './consumer-info/consumer-info.component';
import { EditAccountComponent } from './edit-account/edit-account.component';

@NgModule({
  declarations: [
    CreateAccountComponent,
    ManageAccountsComponent,
    ConsumerInfoComponent,
    EditAccountComponent,
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    //RouterModule.forChild(ExtraRoutes),
    MaterialModule,
    TablerIconsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ComponentsModule,
    FormsModule,
  ]
})
export class AccountsModule { }
