import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  // {
  //   displayName: 'Dashboard',
  //   iconName: 'layout-dashboard',
  //   route: '/dashboard',
  // },
  {
    navCap: 'Consumers',
  },
  // {
  //   displayName: 'Create New Account',
  //   iconName: 'rosette',
  //   route: '/accounts/create-account',
  // },
  {
    displayName: 'Accounts',
    iconName: 'users',
    route: '/accounts/manage-accounts',
  },

  // {
  //   displayName: 'Badge',
  //   iconName: 'rosette',
  //   route: '/ui-components/badge',
  // },
  // {
  //   displayName: 'Chips',
  //   iconName: 'poker-chip',
  //   route: '/ui-components/chips',
  // },
  // {
  //   displayName: 'Lists',
  //   iconName: 'list',
  //   route: '/ui-components/lists',
  // },
  // {
  //   displayName: 'Menu',
  //   iconName: 'layout-navbar-expand',
  //   route: '/ui-components/menu',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'tooltip',
  //   route: '/ui-components/tooltips',
  // },

  {
    navCap: 'Billing',
  },
  {
    displayName: 'Bills',
    iconName: 'currency-dollar',
    route: '/billing/bills',
  },
  {
    displayName: 'Create Bills',
    iconName: 'cash',
    route: '/billing/create-bills',
  },

  {
    navCap: 'Collection',
  },
  {
    displayName: 'Create OR',
    iconName: 'receipt',
    route: '',
  },
  {
    displayName: 'Post OR',
    iconName: 'checklist',
    route: '',
  },

  {
    navCap: 'Admin Settings',
  },
  {
    displayName: 'Charges',
    iconName: 'receipt',
    route: '/admin-settings/charges',
  },
  // {
  //   displayName: 'Icons',
  //   iconName: 'mood-smile',
  //   route: '/extra/icons',
  // },

  // {
  //   navCap: 'Auth',
  // },
  // {
  //   displayName: 'Login',
  //   iconName: 'lock',
  //   route: '/authentication/login',
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'user-plus',
  //   route: '/authentication/register',
  // },
  // {
  //   navCap: 'Extra',
  // },

  // {
  //   displayName: 'Sample Page',
  //   iconName: 'aperture',
  //   route: '/extra/sample-page',
  // },
  // {
  //   navCap: 'Sample',
  // },
  // {
  //   displayName: 'Sample Menu',
  //   iconName: 'mood-smile',
  //   route: '/transaction/sample',
  // }
];
