import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingRoutingModule } from './billing-routing.module';
import { BillsComponent } from './bills/bills.component';
import { CreateBillsComponent } from './create-bills/create-bills.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { CreateSingleBillComponent } from './create-single-bill/create-single-bill.component';
import { BillInfoComponent } from './bill-info/bill-info.component';
import { EditBillComponent } from './edit-bill/edit-bill.component';

@NgModule({
  declarations: [
    BillsComponent,
    CreateBillsComponent,
    CreateSingleBillComponent,
    BillInfoComponent,
    EditBillComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    BillingRoutingModule,
    TablerIconsModule,
    ComponentsModule
  ]
})
export class BillingModule { }
