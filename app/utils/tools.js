const homedir = require('os').homedir();
const fs = require('fs');
const os = require('os');
import {TweenMax} from "gsap";
import {getConfUri} from "./platform.service";
import $ from 'jquery';
var fsPath = require('fs-path');
const settings = require('electron-settings');


module.exports = {

  sendOSNotification: function(body, callback){
      let myNotification = new Notification('Sapphire', {
        body: body
      });

      myNotification.onclick = () => {
        callback();
        ipcRenderer.send('show');
      }
  },

  formatNumber: function (number) {
    return number.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits: 8})
  },

  calculateTimeSince: function(lang, today, iTime){
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

  //Theme Support

  getIconForTheme: function(iconName, hover){
    const selectedTheme = settings.get('settings.display.theme');
    if(!selectedTheme || selectedTheme === "theme-darkEcc"){
      if(iconName == "wallet" && !hover){
        return require('../../resources/images/wallet-white.png')
      }
      else if(iconName == "wallet" && hover){
        return require('../../resources/images/wallet-orange-pastel.png')
      }
      else if(iconName == "fileStorage" && !hover){
        return require('../../resources/images/fileStorage-white.png')
      }
      else if(iconName == "fileStorage" && hover){
        return require('../../resources/images/fileStorage-orange-pastel.png')
      }
      else if(iconName == "messaging" && !hover){
        return require('../../resources/images/messaging-white.png')
      }
      else if(iconName == "messaging" && hover){
        return require('../../resources/images/messaging-orange-pastel.png')
      }
      else if(iconName == "contacts" && !hover){
        return require('../../resources/images/contacts-white.png')
      }
      else if(iconName == "contacts" && hover){
        return require('../../resources/images/contacts-orange-pastel.png')
      }
      else if(iconName == "overview" && !hover){
        return require('../../resources/images/overview-white.png')
      }
      else if(iconName == "overview" && hover){
        return require('../../resources/images/overview-orange-pastel.png')
      }
      else if(iconName == "send" && !hover){
        return require('../../resources/images/send-white.png')
      }
      else if(iconName == "send" && hover){
        return require('../../resources/images/send-orange-pastel.png')
      }
      else if(iconName == "addresses" && !hover){
        return require('../../resources/images/addresses-white.png')
      }
      else if(iconName == "addresses" && hover){
        return require('../../resources/images/addresses-orange-pastel.png')
      }
      else if(iconName == "transactions" && !hover){
        return require('../../resources/images/transactions-white.png')
      }
      else if(iconName == "transactions" && hover){
        return require('../../resources/images/transactions-orange-pastel.png')
      }
      else if(iconName == "search"){
        return require('../../resources/images/search-icon-dark.png')
      }
      else if(iconName == "deleteContact"){
        return require('../../resources/images/delete_contact-pastel.png')
      }
      else if(iconName == "chatContact"){
        return require('../../resources/images/chat-contact-pastel.png')
      }
      else if(iconName == "chatList"){
        return require('../../resources/images/chat-list-pastel.png')
      }
      else if(iconName == "goBackChat"){
        return require('../../resources/images/go-back-chat-pastel.png')
      }
      else if(iconName == "search2" && !hover){
        return require('../../resources/images/search-icon-dark-2.png')
      }
      else if(iconName == "sendEcc" && !hover){
        return require('../../resources/images/send-ecc-dark.png')
      }
      else if(iconName == "disableNotifications" && !hover){
        return require('../../resources/images/disable-notifications-icon.png')
      }
      else if(iconName == "removeChat" && !hover){
        return require('../../resources/images/remove-chat-dark.png')
      }
      else if(iconName == "sendFile" && !hover){
        return require('../../resources/images/file-icon-dark.png')
      }
    }
    else if(selectedTheme && selectedTheme === "theme-defaultEcc"){
      if(iconName == "wallet" && !hover){
        return require('../../resources/images/wallet-blue.png')
      }
      else if(iconName == "wallet" && hover){
        return require('../../resources/images/wallet-orange.png')
      }
      else if(iconName == "fileStorage" && !hover){
        return require('../../resources/images/fileStorage-blue.png')
      }
      else if(iconName == "fileStorage" && hover){
        return require('../../resources/images/fileStorage-orange.png')
      }
      else if(iconName == "messaging" && !hover){
        return require('../../resources/images/messaging-blue.png')
      }
      else if(iconName == "messaging" && hover){
        return require('../../resources/images/messaging-orange.png')
      }
      else if(iconName == "contacts" && !hover){
        return require('../../resources/images/contacts-blue.png')
      }
      else if(iconName == "contacts" && hover){
        return require('../../resources/images/contacts-orange.png')
      }
      else if(iconName == "overview" && !hover){
        return require('../../resources/images/overview-blue.png')
      }
      else if(iconName == "overview" && hover){
        return require('../../resources/images/overview-orange.png')
      }
      else if(iconName == "send" && !hover){
        return require('../../resources/images/send-blue.png')
      }
      else if(iconName == "send" && hover){
        return require('../../resources/images/send-orange.png')
      }
      else if(iconName == "addresses" && !hover){
        return require('../../resources/images/addresses-blue.png')
      }
      else if(iconName == "addresses" && hover){
        return require('../../resources/images/addresses-orange.png')
      }
      else if(iconName == "transactions" && !hover){
        return require('../../resources/images/transactions-blue.png')
      }
      else if(iconName == "transactions" && hover){
        return require('../../resources/images/transactions-orange.png')
      }
      else if(iconName == "search"){
        return require('../../resources/images/search-icon-dark.png')
      }
      else if(iconName == "deleteContact"){
        return require('../../resources/images/delete_contact-orange.png')
      }
    }
  },

  //Animations

  showFunctionIcons: function(element){
    TweenMax.set('.functionIcon', {css:{display: "inline-block"}});
    TweenMax.staggerFromTo('.functionIcon', 0.4, {x: 20, autoAlpha: 0}, {x: 0, autoAlpha: 1}, -0.2);
  },

  hideFunctionIcons: function(element){
    TweenMax.staggerTo('.functionIcon', 0.4, {x: 20, autoAlpha: 0}, -0.2);
    setTimeout(() => {
      TweenMax.set('.functionIcon', {css:{display: "none"}});
    }, 600)
  },

  showTemporaryMessage: function (element, text, time=2000) {
    if(text){
      $(element).text(text)
    }

    TweenMax.to(element, 0.2, {autoAlpha: 1, scale: 1, onComplete: () => {
      setTimeout(() => {
        TweenMax.to(element, 0.2, {autoAlpha: 0, scale: 0.5});
      }, time)
    }});
  },

  highlightInput: function(element, duration){
      TweenMax.to(element, 0.3, {css:{borderBottom: "2px solid #d09128"}});
      TweenMax.to(element, 0.3, {css:{borderBottom: "2px solid #1c2340"}, delay: duration});
  },

  animateGeneralPanelIn: function(element, callback, f , scaleStart){
      TweenMax.set(element, {willChange: 'transform'});
      requestAnimationFrame(() => {
        TweenMax.fromTo(element, 0.15, {autoAlpha: 0, scale: scaleStart}, {autoAlpha: 1, scale: 1, ease: Linear.easeNone, onComplete: callback, onCompleteParams: [f]});
    });
  },

  animateGeneralPanelOut: function(element, callback, f, scaleEnd){
      TweenMax.set(element, {willChange: 'transform'});
      requestAnimationFrame(() => {
        TweenMax.fromTo(element, 0.15, {autoAlpha: 1, scale: 1}, {autoAlpha: 0, scale: scaleEnd, ease: Linear.easeNone, onComplete: callback, onCompleteParams: [f]});
    });
  },

  animateLoaderIn: function(element, updatingApplication, animateLogo, callback){
    console.log("animateLoaderIn");
      TweenMax.fromTo(element, 1, {autoAlpha: 0}, {autoAlpha:1, ease: Linear.easeNone, onComplete: animateLogo, onCompleteParams: [callback]});
      if(updatingApplication){
        $("#gettingReady").text("We are updating your application...")
      }
  },

  animateLoaderOut: function(element, callback){
      TweenMax.fromTo(element, 1, {autoAlpha: 1}, {autoAlpha:0, ease: Linear.easeNone, onComplete: callback});
  },

  animateInitialSetupIn: function(element, callback){
      TweenMax.fromTo(element, 0.5, {autoAlpha: 0, scale: 1}, {autoAlpha:1, scale: 1, ease: Linear.easeNone, onComplete: callback});
  },

  animateInitialSetupOut: function(element, callback){
      TweenMax.fromTo(element, 0.5, {autoAlpha: 1, scale: 1}, {autoAlpha:0, scale: 2.5, ease: Linear.easeNone, onComplete: callback});
  },

  animatePopupIn: function(element, callback, top){
    TweenMax.set(('.mancha'), {css: {display: "block"}});
    TweenMax.fromTo(('.mancha'), 0.3, {autoAlpha:0}, { autoAlpha:1, ease: Linear.easeNone});
    TweenMax.fromTo(element, 0.3, {css: {top: "-50%", opacity:0}}, {css: {top: top, opacity:1}, ease: Power1.easeOut, onComplete: callback});
  },

  animatePopupOut: function(element, callback){
    TweenMax.fromTo(('.mancha'), 0.3, {autoAlpha:1}, { autoAlpha:0, ease: Linear.easeNone});
    TweenMax.to(element, 0.3, {css: {top: "-50%", opacity:0}, ease: Linear.easeIn, onComplete: callback});
  },

  animateStepIn: function(element, callback){
    TweenMax.fromTo(element, 0.3, {x: 600, opacity: 0}, {x: 0, opacity: 1, ease: Linear.easeNone, onComplete: callback});
  },

  animateStepOut: function(element, callback){
    TweenMax.fromTo(element, 0.2, {x: 0, opacity: 1}, {x: -600, opacity: 0, ease: Linear.easeNone, onComplete: callback});
  },

  //Animations end

  updateConfig: function(staking){
    return new Promise((resolve, reject) => {
      if(fs.existsSync(getConfUri())){
        fs.readFile(getConfUri(), 'utf8', (err, data) => {
          if (err) {
            console.log("readFile error: ", err);
            reject(false);
          }
          if (/staking=[0-9]/g.test(data)) {
            const result = data.replace(/staking=[0-9]/g, 'staking='+staking);

            fs.writeFileSync(getConfUri(), result, 'utf8', (err) => {
              if (err) {
                console.log("writeFileSync error: ", err);
                reject(false);
              }
              else{
                console.log("done updating config");
                resolve(true);
              }
            });

          } else {

            fs.appendFileSync(getConfUri(), os.EOL + 'staking='+staking, 'utf8', (err) => {
              if (err) {
                console.log("appendFile error: ", err);
                reject(false);
              }
              resolve(true);
            });
          }
        });
      }

    });
  },

  generateId: function(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  updateOrCreateConfig(username, password){
    return new Promise((resolve, reject) => {
      fs.exists(getConfUri(), (exists) => {
        if(!exists){
           //create
           const toWrite = "maxconnections=100" + os.EOL + "rpcuser=" + username + os.EOL + "rpcpassword=" + password + os.EOL + "addnode=www.cryptounited.io" + os.EOL + "rpcport=19119" + os.EOL + "rpcconnect=127.0.0.1" + os.EOL + "staking=0" + os.EOL + "zapwallettxes=0";
           fsPath.writeFile(getConfUri(), toWrite, 'utf8', (err) => {
                if (err) {
                  console.log(err);
                  resolve(false);
                  return;
                }
                resolve(true);
            });
        }
        else{
          fs.readFile(getConfUri(), 'utf8', (err, data) => {
            if (err) {
               console.log("readFile error: ", err);
               resolve(false);
               return;
            }
            var patt = /(rpcuser=(.*))/g;
            var myArray = patt.exec(data);
            var result = data;
            if(myArray && myArray.length > 2)
            {
              result = result.replace('rpcuser='+myArray[2], 'rpcuser='+username);
            }
            else{
              result += `${os.EOL}rpcuser=${username}`;
            }

            patt = /(rpcpassword=(.*))/g;
            myArray = patt.exec(data);
            if(myArray && myArray.length > 2)
            {
              result = result.replace('rpcpassword='+myArray[2], 'rpcpassword='+password);
            }
            else{
              result += `${os.EOL}rpcpassword=${password}`;
            }

            fs.writeFile(getConfUri(), result, 'utf8', (err) => {
              if(!err)
                resolve(true);
              else resolve(false);
            });
          });
        }
      });
    });
  },

  readRpcCredentials(){
    var toReturn = null;
    return new Promise((resolve, reject) => {
      fs.exists(getConfUri(), (exists) => {
        if(!exists){
           resolve(toReturn);
           return;
        }
        fs.readFile(getConfUri(), 'utf8', (err, data) => {
          if (err) {
            console.log("readFile error: ", err);
            resolve(toReturn);
            return;
          }
          toReturn = {
            username: "",
            password: ""
          };
          var patt = /(rpcuser=(.*))/g;
          var myArray = patt.exec(data);
          if(myArray && myArray.length > 2)
          {
            toReturn.username = myArray[2];
          }

          patt = /(rpcpassword=(.*))/g;
          myArray = patt.exec(data);
          if(myArray && myArray.length > 2)
          {
            toReturn.password = myArray[2];
          }
          resolve(toReturn);
        });
      })
    });
  },
};

