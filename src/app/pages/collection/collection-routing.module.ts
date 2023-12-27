import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOrComponent } from './create-or/create-or.component';
import { ViewOrComponent } from './view-or/view-or.component';
import { PostOrComponent } from './post-or/post-or.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create-or',
        component: CreateOrComponent,
      },
      {
        path: 'view-or',
        component: ViewOrComponent,
      },
      {
        path: 'post-or',
        component: PostOrComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
