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
import BasicLayout from './../Layouts/Basic';

// Sidebars
import MainSidebar from '../containers/MainSidebar';
import SettingSidebar from '../containers/SettingSidebar';

export default [
  {
    component: SetupLayout,
    path: '/setup'
  },
  {
    component: BasicLayout,
    path: '/',
    routes: [
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
        path: '/coin',
        routes: [
          {
            path: '/coin',
            exact: true,
            component: HomePage
          },
          {
            path: '/coin/send',
            component: SendPage
          },
          {
            path: '/coin/addresses',
            component: ReceivePage
          },
          {
            path: '/coin/transactions',
            component: TransactionPage
          },
          {
            path: '/coin/network',
            component: NetworkStatsPage
          },
          {
            path: '/coin/contacts',
            component: ContactsPage
          },
          {
            path: '/coin/messages',
            component: MessagingPage
          },
          {
            path: '/coin/files',
            component: FileStoragePage
          }
        ]
      },
      {
        path: '/news',
        component: NewsPage
      }
    ]
  }
];
