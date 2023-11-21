import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FilterCustomerComponent } from './filter-customer/filter-customer.component';
import { AddChargesComponent } from './add-charges/add-charges.component';
import { FormChargesComponent } from './form-charges/form-charges.component';
import { ContentHeaderComponent } from './content-header/content-header.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AddCustomerChargesComponent } from './add-customer-charges/add-customer-charges.component';
import { EditCustomerChargesComponent } from './edit-customer-charges/edit-customer-charges.component';
import { SearchConsumerComponent } from './search-consumer/search-consumer.component';
import { ConfirmationPromptComponent } from './confirmation-prompt/confirmation-prompt.component';
import { PasswordPromptComponent } from './password-prompt/password-prompt.component';
import { CancelBillComponent } from './cancel-bill/cancel-bill.component';
import { BillFormComponent } from './bill-form/bill-form.component';
import { AccountFormComponent } from './account-form/account-form.component';

@NgModule({
  declarations: [
    FilterCustomerComponent,
    AddChargesComponent,
    FormChargesComponent,
    ContentHeaderComponent,
    AddCustomerChargesComponent,
    EditCustomerChargesComponent,
    SearchConsumerComponent,
    ConfirmationPromptComponent,
    PasswordPromptComponent,
    CancelBillComponent,
    BillFormComponent,
    AccountFormComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TablerIconsModule
  ],
  exports: [
    FilterCustomerComponent,
    FormChargesComponent,
    ContentHeaderComponent,
    BillFormComponent,
    AccountFormComponent,
  ]
})
export class ComponentsModule { }
