import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOrComponent } from './create-or/create-or.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create-or',
        component: CreateOrComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
