// Pages
import MessagingPage from './../containers/Pages/MessagingPage';
import HomePage from './../containers/Pages/HomePage';
import ReceivePage from './../containers/Pages/ReceivePage';
import TransactionPage from './../containers/Pages/TransactionPage';
import SendPage from './../containers/Pages/SendPage';
import ContactsPage from './../containers/Pages/ContactsPage';
import NetworkStatsPage from './../containers/Pages/NetworkStatsPage';
import NewsPage from './../containers/Pages/NewsPage';
import FileStoragePage from './../containers/Pages/FileStoragePage';

// Settings
import SettingsAdvanced from '../components/SettingsPage/pages/Advanced';
import SettingsDonate from '../components/SettingsPage/pages/Donate';
import SettingsLanguage from '../components/SettingsPage/pages/Language';
import SettingsNotifications from '../components/SettingsPage/pages/Notifications';
import SettingsAppearance from '../components/SettingsPage/pages/Appearance';
import SettingsWallet from '../components/SettingsPage/pages/Wallet';
import SettingsGeneral from '../components/SettingsPage/pages/General';

// Layouts
import MainLayout from './../Layouts/Main';
import SetupLayout from './../Layouts/Setup';

// Sidebars
import MainSidebar from '../containers/MainSidebar';
import SettingSidebar from '../containers/SettingSidebar';

export default [
  {
    component: SetupLayout,
    path: '/setup'
  },
  {
    component: MainLayout,
    sidebar: SettingSidebar,
    path: '/settings',
    routes: [
      {
        path: '/settings',
        exact: true,
        component: SettingsGeneral
      },
      {
        path: '/settings/wallet',
        component: SettingsWallet
      },
      {
        path: '/settings/notifications',
        component: SettingsNotifications
      },
      {
        path: '/settings/appearance',
        component: SettingsAppearance
      },
      {
        path: '/settings/language',
        component: SettingsLanguage
      },
      {
        path: '/settings/donate',
        component: SettingsDonate
      },
      {
        path: '/settings/advanced',
        component: SettingsAdvanced
      }
    ]
  },
  {
    component: MainLayout,
    sidebar: MainSidebar,
    routes: [
      {
        path: '/',
        exact: true,
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
  }
];
