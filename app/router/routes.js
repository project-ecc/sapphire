// Pages
import HomePage from './../components/Dashboard/Index';
import ReceivePage from '../components/Receive/Index';
import TransactionPage from './../components/Transactions/Index';
import SendPage from '../components/Send/Index';
import ContactsPage from './../components/Contacts/Index';
import NetworkStatsPage from './../components/NetworkStats/Index';
import NewsPage from '../components/News/Index';
// Settings
import SettingsAdvanced from '../components/Settings/Advanced';
import SettingsDonate from '../components/Settings/Donate';
import SettingsLanguage from '../components/Settings/Language';
import SettingsNotifications from '../components/Settings/Notifications';
import SettingsAppearance from '../components/Settings/Appearance';
import SettingsWallet from '../components/Settings/Wallet';
import SettingsGeneral from '../components/Settings/General';
// Layouts
import MainLayout from './../Layouts/Main';
import Setup from '../components/Setup/Index';
import BasicLayout from './../Layouts/Basic';
// Sidebars
import MainSidebar from '../Layouts/partials/MainSidebar';
import SettingSidebar from '../Layouts/partials/SettingSidebar';
import MessagingSidebar from '../Layouts/partials/MessagingSidebar';
// Setup
import SetupStart from './../components/Setup/partials/Start';
import SetupTheme from './../components/Setup/partials/Theme';
import SetupImportWallet from '../components/Setup/partials/ImportWallet';
import SetupEncrypt from './../components/Setup/partials/Encrypt';
import SetupImportPrivateKeys from './../components/Setup/partials/ImportPrivateKeys';
import SetupComplete from './../components/Setup/partials/Complete';

//Social
import MessagingHome from '../components/Social/MessagingHome'
import MessagingNew from "../components/Social/MessagingNew";

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
            path: '/coin/receive',
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
          }
        ]
      },
      {
        path: '/news',
        component: NewsPage
      },
      {
        component: MainLayout,
        sidebar: MessagingSidebar,
        path: '/friends',
        routes: [
          {
            path: '/friends',
            exact: true,
            component: MessagingHome
          },
          {
            path: "/friends/newMessage",
            component : MessagingNew
          },
          {
            path: '/friends/:id',
            component: MessagingHome
          }
        ]
      }
    ]
  }
];
