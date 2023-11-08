import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminSettingsRoutingModule } from './admin-settings-routing.module';
import { ChargesComponent } from './charges/charges.component';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ComponentsModule } from 'src/app/components/components.module';
import { EditChargesComponent } from './edit-charges/edit-charges.component';
import { ManageCustomerChargesComponent } from './manage-customer-charges/manage-customer-charges.component';


@NgModule({
  declarations: [
    ChargesComponent,
    EditChargesComponent,
    ManageCustomerChargesComponent
  ],
  imports: [
    CommonModule,
    AdminSettingsRoutingModule,
    MaterialModule,
    TablerIconsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FormsModule,
    ComponentsModule
  ]
})
export class AdminSettingsModule { }
