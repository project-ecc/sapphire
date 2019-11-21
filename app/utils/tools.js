import {getConfUri} from './platform.service.js';
var fs = require('fs')
const os = require('os');
const settings = require('electron-settings');

module.exports = {

  // MISC
  async sendOSNotification(body, callback, title = null) {
    console.log('trying to send notification', Notification.permission)
    if(title == null){
      title = ''
    }
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          const myNotification = new window.Notification(title, {
            body,
            icon: require('../../resources/icons/128x128.png')
          });

          myNotification.onclick = () => {
            callback();
            // ipcRenderer.send('show');
          };
        }});
    } else {
      const myNotification = new window.Notification(title, {
        body,
        icon: require('../../resources/icons/128x128.png')
      });

      myNotification.onclick = () => {
        callback();
        // ipcRenderer.send('show');
      };
    }
  },

  formatNumber(number) {
    return number.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  },

  calculateTimeSince(lang, today, iTime) {
    let delta = Math.abs(today.getTime() - iTime.getTime()) / 1000;
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;
    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    const minutes = Math.floor(delta / 60) % 60;


    let time = '';
    if (settings.get('settings.lang') === 'fr') {
      time = `${lang.translationExclusiveForFrench} `;
    }
    if (days > 0) {
      time += `${days} `;
      if (days === 1) {
        time += lang.transactionsDay;
      } else {
        time += lang.transactionsDays;
      }
    } else if (hours > 0) {
      time += `${hours} `;
      if (hours === 1) {
        time += lang.transactionsHour;
      } else {
        time += lang.transactionsHours;
      }
    } else if (minutes === 1) {
      time += `${minutes} ${lang.transactionsMinute}`;
    } else {
      time += `${minutes} ${lang.transactionsMinutes}`;
    }
    return time;
  },


  // Theme Support

  getIconForTheme(iconName, hover, theme = undefined) {
    const selectedTheme = !theme ? settings.get('settings.display.theme') : theme;
    if (!selectedTheme || selectedTheme === 'theme-darkEcc') {
      if (iconName == 'wallet' && !hover) {
        return require('../../resources/images/wallet-white.png');
      } else if (iconName == 'wallet' && hover) {
        return require('../../resources/images/wallet-orange-pastel.png');
      } else if (iconName == 'fileStorage' && !hover) {
        return require('../../resources/images/fileStorage-white.png');
      } else if (iconName == 'fileStorage' && hover) {
        return require('../../resources/images/fileStorage-orange-pastel.png');
      } else if (iconName == 'messaging' && !hover) {
        return require('../../resources/images/messaging-white.png');
      } else if (iconName == 'messaging' && hover) {
        return require('../../resources/images/messaging-orange-pastel.png');
      } else if (iconName == 'contacts' && !hover) {
        return require('../../resources/images/contacts-white.png');
      } else if (iconName == 'contacts' && hover) {
        return require('../../resources/images/contacts-orange-pastel.png');
      } else if (iconName == 'overview' && !hover) {
        return require('../../resources/images/overview-white.png');
      } else if (iconName == 'overview' && hover) {
        return require('../../resources/images/overview-orange-pastel.png');
      } else if (iconName == 'send' && !hover) {
        return require('../../resources/images/send-white.png');
      } else if (iconName == 'send' && hover) {
        return require('../../resources/images/send-orange-pastel.png');
      } else if (iconName == 'addresses' && !hover) {
        return require('../../resources/images/addresses-white.png');
      } else if (iconName == 'addresses' && hover) {
        return require('../../resources/images/addresses-orange-pastel.png');
      } else if (iconName == 'transactions' && !hover) {
        return require('../../resources/images/transactions-white.png');
      } else if (iconName == 'transactions' && hover) {
        return require('../../resources/images/transactions-orange-pastel.png');
      } else if (iconName == 'search') {
        return require('../../resources/images/search-icon-dark.png');
      } else if (iconName == 'deleteContact') {
        return require('../../resources/images/delete_contact-pastel.png');
      } else if (iconName == 'chatContact') {
        return require('../../resources/images/chat-contact-pastel.png');
      } else if (iconName == 'chatList') {
        return require('../../resources/images/chat-list-pastel.png');
      } else if (iconName == 'goBackChat') {
        return require('../../resources/images/go-back-chat-pastel.png');
      } else if (iconName == 'search2' && !hover) {
        return require('../../resources/images/search-icon-dark-2.png');
      } else if (iconName == 'sendEcc' && !hover) {
        return require('../../resources/images/send-ecc-dark.png');
      } else if (iconName == 'disableNotifications' && !hover) {
        return require('../../resources/images/disable-notifications-icon.png');
      } else if (iconName == 'removeChat' && !hover) {
        return require('../../resources/images/remove-chat-dark.png');
      } else if (iconName == 'sendFile' && !hover) {
        return require('../../resources/images/file-icon-dark.png');
      } else if (iconName == 'messagingIconPopup') {
        return require('../../resources/images/messaging-icon-popup-pastel.png');
      } else if (iconName == 'messagingIconPopupConfirm') {
        return require('../../resources/images/messaging-confirm-button-light-blue.png');
      } else if (iconName == 'facebook' && !hover) {
        return require('../../resources/images/facebook-icon-dark.png');
      } else if (iconName == 'facebook' && hover) {
        return require('../../resources/images/facebook-icon-pastel.png');
      } else if (iconName == 'slack' && !hover) {
        return require('../../resources/images/slack-icon-dark.png');
      } else if (iconName == 'slack' && hover) {
        return require('../../resources/images/slack-icon-pastel.png');
      } else if (iconName == 'reddit' && !hover) {
        return require('../../resources/images/reddit-icon-dark.png');
      } else if (iconName == 'reddit' && hover) {
        return require('../../resources/images/reddit-icon-pastel.png');
      } else if (iconName == 'medium' && !hover) {
        return require('../../resources/images/medium-icon-dark.png');
      } else if (iconName == 'medium' && hover) {
        return require('../../resources/images/medium-icon-pastel.png');
      } else if (iconName == 'twitter' && !hover) {
        return require('../../resources/images/twitter-icon-dark.png');
      } else if (iconName == 'twitter' && hover) {
        return require('../../resources/images/twitter-icon-pastel.png');
      } else if (iconName == 'fileStorageBig') {
        return require('../../resources/images/file-storage-message-pastel.png');
      } else if (iconName == 'messagingNotSelected') {
        return require('../../resources/images/messaging-default-not-selected.png');
      } else if (iconName == 'messagingSelected') {
        return require('../../resources/images/messaging-blue-selected.png');
      } else if (iconName == 'fileStorageNotSelected') {
        return require('../../resources/images/file-storage-default-not-selected.png');
      } else if (iconName == 'fileStorageSelected') {
        return require('../../resources/images/file-storage-blue-selected.png');
      } else if (iconName == 'eccNewsNotif') {
        return require('../../resources/images/news-white-notif.png');
      } else if (iconName == 'connectionsPaymentChain') {
        return require('../../resources/images/connections-orange-pastel.png');
      } else if (iconName == 'discord') {
        return require('../../resources/images/discord.png');
      }
    } else if (selectedTheme && selectedTheme === 'theme-defaultEcc') {
      if (iconName == 'wallet' && !hover) {
        return require('../../resources/images/wallet-blue.png');
      } else if (iconName == 'wallet' && hover) {
        return require('../../resources/images/wallet-orange.png');
      } else if (iconName == 'fileStorage' && !hover) {
        return require('../../resources/images/fileStorage-blue.png');
      } else if (iconName == 'fileStorage' && hover) {
        return require('../../resources/images/fileStorage-orange.png');
      } else if (iconName == 'messaging' && !hover) {
        return require('../../resources/images/messaging-blue.png');
      } else if (iconName == 'messaging' && hover) {
        return require('../../resources/images/messaging-orange.png');
      } else if (iconName == 'contacts' && !hover) {
        return require('../../resources/images/contacts-blue.png');
      } else if (iconName == 'contacts' && hover) {
        return require('../../resources/images/contacts-orange.png');
      } else if (iconName == 'overview' && !hover) {
        return require('../../resources/images/overview-blue.png');
      } else if (iconName == 'overview' && hover) {
        return require('../../resources/images/overview-orange.png');
      } else if (iconName == 'send' && !hover) {
        return require('../../resources/images/send-blue.png');
      } else if (iconName == 'send' && hover) {
        return require('../../resources/images/send-orange.png');
      } else if (iconName == 'addresses' && !hover) {
        return require('../../resources/images/addresses-blue.png');
      } else if (iconName == 'addresses' && hover) {
        return require('../../resources/images/addresses-orange.png');
      } else if (iconName == 'transactions' && !hover) {
        return require('../../resources/images/transactions-blue.png');
      } else if (iconName == 'transactions' && hover) {
        return require('../../resources/images/transactions-orange.png');
      } else if (iconName == 'search') {
        return require('../../resources/images/search-icon-dark.png');
      } else if (iconName == 'deleteContact') {
        return require('../../resources/images/delete_contact-orange.png');
      } else if (iconName == 'search') {
        return require('../../resources/images/search-icon-dark.png');
      } else if (iconName == 'deleteContact') {
        return require('../../resources/images/delete_contact-pastel.png');
      } else if (iconName == 'chatContact') {
        return require('../../resources/images/chat-contact-orange.png');
      } else if (iconName == 'chatList') {
        return require('../../resources/images/chat-list-orange.png');
      } else if (iconName == 'goBackChat') {
        return require('../../resources/images/go-back-chat-orange.png');
      } else if (iconName == 'search2' && !hover) {
        return require('../../resources/images/search-icon-light-blue-2.png');
      } else if (iconName == 'sendEcc' && !hover) {
        return require('../../resources/images/send-ecc-light-blue.png');
      } else if (iconName == 'disableNotifications' && !hover) {
        return require('../../resources/images/disable-notifications-light-blue-icon.png');
      } else if (iconName == 'removeChat' && !hover) {
        return require('../../resources/images/remove-chat-light-blue.png');
      } else if (iconName == 'sendFile' && !hover) {
        return require('../../resources/images/file-icon-light-blue.png');
      } else if (iconName == 'messagingIconPopup') {
        return require('../../resources/images/messaging-icon-popup-orange.png');
      } else if (iconName == 'messagingIconPopupConfirm') {
        return require('../../resources/images/messaging-confirm-button-light-blue.png');
      } else if (iconName == 'facebook' && !hover) {
        return require('../../resources/images/facebook-icon-dark-blue.png');
      } else if (iconName == 'facebook' && hover) {
        return require('../../resources/images/facebook-icon-orange.png');
      } else if (iconName == 'slack' && !hover) {
        return require('../../resources/images/slack-icon-dark-blue.png');
      } else if (iconName == 'slack' && hover) {
        return require('../../resources/images/slack-icon-orange.png');
      } else if (iconName == 'reddit' && !hover) {
        return require('../../resources/images/reddit-icon-dark-blue.png');
      } else if (iconName == 'reddit' && hover) {
        return require('../../resources/images/reddit-icon-orange.png');
      } else if (iconName == 'medium' && !hover) {
        return require('../../resources/images/medium-icon-dark-blue.png');
      } else if (iconName == 'medium' && hover) {
        return require('../../resources/images/medium-icon-orange.png');
      } else if (iconName == 'twitter' && !hover) {
        return require('../../resources/images/twitter-icon-dark-blue.png');
      } else if (iconName == 'twitter' && hover) {
        return require('../../resources/images/twitter-icon-orange.png');
      } else if (iconName == 'fileStorageBig') {
        return require('../../resources/images/file-storage-message-orange.png');
      } else if (iconName == 'messagingNotSelected') {
        return require('../../resources/images/messaging-dark-not-selected.png');
      } else if (iconName == 'messagingSelected') {
        return require('../../resources/images/messaging-blue-selected-dark.png');
      } else if (iconName == 'fileStorageNotSelected') {
        return require('../../resources/images/file-storage-dark-not-selected.png');
      } else if (iconName == 'fileStorageSelected') {
        return require('../../resources/images/file-storage-blue-selected-dark.png');
      } else if (iconName == 'eccNewsNotif') {
        return require('../../resources/images/news-blue-notif.png');
      } else if (iconName == 'connectionsPaymentChain') {
        return require('../../resources/images/connections-orange.png');
      } else if (iconName == 'discord') {
        return require('../../resources/images/discord.png');
      }
    }
  },

  createInstallScript(commands, path) {
    let script = '';
    commands.map((line) => {
      script += line + os.EOL;
    });
    return new Promise((resolve, reject) => {
      fs.writeFile(path, script, (err) => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  },

  updateConfig(staking) {
    return new Promise((resolve, reject) => {
      const confFile = getConfUri();
      console.log(confFile);

      if (fs.existsSync(confFile)) {
        fs.readFile(confFile, 'utf8', (err, data) => {
          if (err) {
            console.log('readFile error: ', err);
            reject(false);
          }
          if (/staking=[0-9]/g.test(data)) {
            const result = data.replace(/staking=[0-9]/g, `staking=${staking}`);


            fs.writeFile(confFile, result, 'utf8', (error) => {
              console.log('in the writer');
              if (error) {
                console.log('writeFileSync error: ', error);
                reject(false);
              } else {
                console.log('done');
                console.log('done updating config');
                resolve(true);
              }
            });
          } else {
            fs.appendFile(confFile, `${os.EOL}staking=${staking}`, 'utf8', (err) => {
              if (err) {
                console.log('appendFile error: ', err);
                reject(false);
              }
              resolve(true);
            });
          }
        });
      }
    });
  },

  toggleBetaMode(result) {
    return new Promise((resolve, reject) => {
      var toggle = result | 0;
      const confFile = getConfUri();
      console.log(confFile);

      if (fs.existsSync(confFile)) {
        fs.readFile(confFile, 'utf8', (err, data) => {
          if (err) {
            console.log('readFile error: ', err);
            reject(false);
          }
          if (/beta=[0-9]/g.test(data)) {
            const result = data.replace(/beta=[0-9]/g, `beta=${toggle}`);


            fs.writeFile(confFile, result, 'utf8', (error) => {
              console.log('in the writer');
              if (error) {
                console.log('writeFileSync error: ', error);
                reject(false);
              } else {
                console.log('done');
                console.log('done updating config');
                resolve(true);
              }
            });
          } else {
            fs.appendFile(confFile, `${os.EOL}beta=${toggle}`, 'utf8', (err) => {
              if (err) {
                console.log('appendFile error: ', err);
                reject(false);
              }
              resolve(true);
            });
          }
        });
      }
    });
  },

  readBetaMode() {
    let toReturn = null;
    return new Promise((resolve, reject) => {
      fs.exists(getConfUri(), (exists) => {
        if (!exists) {
          resolve(toReturn);
          return;
        }
        fs.readFile(getConfUri(), 'utf8', (err, data) => {
          if (err) {
            console.log('readFile error: ', err);
            resolve(toReturn);
            return;
          }
          toReturn = 0;
          let patt = /(beta=(.*))/g;
          let myArray = patt.exec(data);
          if (myArray && myArray.length > 2) {
            toReturn = myArray[2];
          }
          resolve(toReturn);
        });
      });
    });
  },

  generateId(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }

    return text;
  },

  async updateOrCreateConfig(username, password) {
    return new Promise(async (resolve, reject) => {
      await fs.exists(getConfUri(), async (exists) => {
        if (!exists) {
           // create
          const toWrite = `maxconnections=100${os.EOL}rpcuser=${username}${os.EOL}rpcpassword=${password}${os.EOL}addnode=www.cryptounited.io${os.EOL}rpcport=19119${os.EOL}rpcconnect=127.0.0.1${os.EOL}staking=0${os.EOL}zapwallettxes=0`;
          fs.writeFile(getConfUri(), toWrite, 'utf8', (err) => {
            if (err) {
              console.log(err);
              resolve(false);
              return;
            }
            resolve(true);
          });
        } else {
          await fs.readFile(getConfUri(), 'utf8', async (err, data) => {
            if (err) {
              console.log('readFile error: ', err);
              resolve(false);
              return;
            }
            let patt = /(rpcuser=(.*))/g;
            let myArray = patt.exec(data);
            let result = data;
            if (myArray && myArray.length > 2) {
              result = result.replace(`rpcuser=${myArray[2]}`, `rpcuser=${username}`);
            } else {
              result += `${os.EOL}rpcuser=${username}`;
            }

            patt = /(rpcpassword=(.*))/g;
            myArray = patt.exec(data);
            if (myArray && myArray.length > 2) {
              result = result.replace(`rpcpassword=${myArray[2]}`, `rpcpassword=${password}`);
            } else {
              result += `${os.EOL}rpcpassword=${password}`;
            }

            await fs.writeFile(getConfUri(), result, 'utf8', (err) => {
              if (!err) { resolve(true); } else resolve(false);
            });
          });
        }
      });
    });
  },

  readRpcCredentials() {
    let toReturn = null;
    return new Promise((resolve, reject) => {
      fs.exists(getConfUri(), (exists) => {
        if (!exists) {
          resolve(toReturn);
          return;
        }
        fs.readFile(getConfUri(), 'utf8', (err, data) => {
          if (err) {
            console.log('readFile error: ', err);
            resolve(toReturn);
            return;
          }
          toReturn = {
            username: '',
            password: ''
          };
          let patt = /(rpcuser=(.*))/g;
          let myArray = patt.exec(data);
          if (myArray && myArray.length > 2) {
            toReturn.username = myArray[2];
          }

          patt = /(rpcpassword=(.*))/g;
          myArray = patt.exec(data);
          if (myArray && myArray.length > 2) {
            toReturn.password = myArray[2];
          }
          resolve(toReturn);
        });
      });
    });
  },
  formatVersion(unformattedVersion) {
    const version = String(unformattedVersion).split('');
    let formattedString = '';
    while (true) {
      const sb = ['.'];
      while (sb.length < 3 && version.length > 0) {
        sb.push(version.pop());
      }
      if (sb.length > 1) {
        let tempSB = '';
        for (let i = sb.length - 1; i > 0; i--) {
          tempSB += String(sb[i]);
        }
        tempSB = String(parseInt(tempSB));
        tempSB = String(sb[0]) + tempSB;
        formattedString = String(tempSB) + formattedString;
      }
      // console.log(formattedString);
      if (formattedString.match(/\./g).length < 4 && version.length === 0) {
        formattedString = String('0') + String(formattedString);
        break;
      }
      if (formattedString.match(/\./g).length >= 4 && version.length === 0) {
        formattedString = formattedString.substr(1);
        break;
      }
    }
    // console.log(formattedString)
    return formattedString;
  },
  compareVersion(v1, v2) {
    // This will split both the versions by '.'
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');

    // Initializer for the version arrays
    let i = 0;

    // We have taken into consideration that both the
    // versions will contains equal number of delimiters
    while (i < arr1.length) {
      // Version 2 is greater than version 1
      if (parseInt(arr2[i]) > parseInt(arr1[i])) {
        return -1;
      }

      // Version 1 is greater than version 2
      if (parseInt(arr1[i]) > parseInt(arr2[i])) {
        return 1;
      }

      // We can't conclude till now
      i += 1;
    }
    // Both the versions are equal
    return 0;
  },

  similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  },

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) { costs[j] = j; } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) { costs[s2.length] = lastValue; }
    }
    return costs[s2.length];
  },

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};
