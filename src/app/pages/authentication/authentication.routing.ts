import { Routes } from '@angular/router';

import { AppSideLoginComponent } from './login/login.component';
import { AppSideRegisterComponent } from './register/register.component';
import { LoginRedirectGuard } from 'src/app/login-redirect.guard';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      // {
      //   path: '',
      //   redirectTo: 'login',
      //   pathMatch: 'full',
      // },
      {
        path: 'login',
        component: AppSideLoginComponent,
        canActivate: [LoginRedirectGuard],
      },
      {
        path: 'register',
        component: AppSideRegisterComponent,
      },
    ],
  },
];
