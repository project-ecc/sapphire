// Pages
import MessagingPage from './../components/Messaging/Index';
import HomePage from './../components/Dashboard/Index';
import ReceivePage from '../components/Addresses/Index';
import TransactionPage from './../components/Transactions/Index';
import SendPage from '../components/Send/Index';
import ContactsPage from './../components/Contacts/Index';
import NetworkStatsPage from './../components/NetworkStats/Index';
import NewsPage from '../components/News/Index';
import FileStoragePage from './../components/FileStorage/Index';

// Settings
import SettingsAdvanced from '../components/Settings/pages/Advanced';
import SettingsDonate from '../components/Settings/pages/Donate';
import SettingsLanguage from '../components/Settings/pages/Language';
import SettingsNotifications from '../components/Settings/pages/Notifications';
import SettingsAppearance from '../components/Settings/pages/Appearance';
import SettingsWallet from '../components/Settings/pages/Wallet';
import SettingsGeneral from '../components/Settings/pages/General';

// Layouts
import MainLayout from './../Layouts/Main';
import Setup from '../components/Setup/Index';
import BasicLayout from './../Layouts/Basic';

// Sidebars
import MainSidebar from '../Layouts/partials/MainSidebar';
import SettingSidebar from '../Layouts/partials/SettingSidebar';

// Setup
import SetupStart from './../components/Setup/partials/Start';
import SetupTheme from './../components/Setup/partials/Theme';
import SetupImportWallet from '../components/Setup/partials/ImportWallet';
import SetupEncrypt from './../components/Setup/partials/Encrypt';
import SetupImportPrivateKeys from './../components/Setup/partials/ImportPrivateKeys';
import SetupComplete from './../components/Setup/partials/Complete';

export default [
  {
    component: Setup,
    path: '/setup',
    routes: [
      {
        path: '/setup',
        exact: true,
        component: SetupStart
      },
      {
        path: '/setup/theme',
        component: SetupTheme
      },
      {
        path: '/setup/import',
        component: SetupImportWallet
      },
      {
        path: '/setup/keys',
        component: SetupImportPrivateKeys
      },
      {
        path: '/setup/encrypt',
        component: SetupEncrypt
      },
      {
        path: '/setup/complete',
        component: SetupComplete
      }
    ]
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
