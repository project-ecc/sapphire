// Pages
import MessagingPage from './../containers/Pages/MessagingPage';
import HomePage from './../containers/Pages/HomePage';
import ReceivePage from './../containers/Pages/ReceivePage';
import TransactionPage from './../containers/Pages/TransactionPage';
import SendPage from './../containers/Pages/SendPage';
import SettingsPage from './../containers/Pages/SettingsPage';
import ContactsPage from './../containers/Pages/ContactsPage';
import NetworkStatsPage from './../containers/Pages/NetworkStatsPage';
import NewsPage from './../containers/Pages/NewsPage';
import FileStoragePage from './../containers/Pages/FileStoragePage';

// Layouts
import MainLayout from './../Layouts/Main';
import SettingsLayout from './../Layouts/Settings';

export default [
  {
    path: '/',
    component: MainLayout,
    routes: [
      {
        path: '/',
        component: HomePage
      },
      {
        path: '/send',
        component: SendPage
      },
      {
        path: '/addresses',
        component: ReceivePage
      },
      {
        path: '/transactions',
        component: TransactionPage
      },
      {
        path: '/news',
        component: NewsPage
      },
      {
        path: '/network',
        component: NetworkStatsPage
      },
      {
        path: '/contacts',
        component: ContactsPage
      },
      {
        path: '/messages',
        component: MessagingPage
      },
      {
        path: '/files',
        component: FileStoragePage
      }
    ]
  },
  {
    path: '/settings',
    component: SettingsLayout,
    routes: [
      {
        path: '',
        component: SettingsPage
      }
    ]
  }
];
