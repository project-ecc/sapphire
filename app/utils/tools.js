const homedir = require('os').homedir();
const fs = require('fs');
const os = require('os');
import {TweenMax} from "gsap";
import $ from 'jquery';
var fsPath = require('fs-path');
const settings = require('electron-settings');

module.exports = {
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

  //Animations

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
        TweenMax.fromTo(element, 0.2, {autoAlpha: 0, scale: scaleStart}, {autoAlpha: 1, scale: 1, ease: Linear.easeNone, onComplete: callback, onCompleteParams: [f]});
    });
  },

  animateGeneralPanelOut: function(element, callback, f, scaleEnd){
      TweenMax.set(element, {willChange: 'transform'});
      requestAnimationFrame(() => {
        TweenMax.fromTo(element, 0.2, {autoAlpha: 1, scale: 1}, {autoAlpha: 0, scale: scaleEnd, ease: Linear.easeNone, onComplete: callback, onCompleteParams: [f]});
    });
  },

  animateLoaderIn: function(element, updatingApplication, animateLogo, callback){
    console.log("animateLoaderIn")
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
    TweenMax.set(('.mancha'), {css: {display: "block"}})
    TweenMax.fromTo(('.mancha'), 0.3, {autoAlpha:0}, { autoAlpha:1, ease: Linear.easeNone});
    TweenMax.fromTo(element, 0.3, {css: {top: "-50%", opacity:0}}, {css: {top: top, opacity:1}, ease: Linear.easeOut, onComplete: callback});
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
    const directory = process.platform === "win32" ? `${homedir}/appdata/roaming/eccoin` : `${homedir}/.eccoin`;
    const filePath = process.platform === "win32" ? `${homedir}/appdata/roaming/eccoin/eccoin.conf` : `${homedir}/.eccoin/eccoin.conf`;
    if(fs.existsSync(filePath)){  
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
           console.log("readFile error: ", err);
           return;
        }
        if (/staking=[0-9]/g.test(data)) {
            const result = data.replace(/staking=[0-9]/g, 'staking='+staking);

          fs.writeFileSync(filePath, result, 'utf8', (err) => {
            if (err) {
              console.log("writeFileSync error: ", err); 
              return;
            }
            else{
              console.log("done updating config")
              return;
            }
          });
          
        } else {

          fs.appendFileSync(filePath, os.EOL + 'staking='+staking, 'utf8', (err) => {
            if (err) {
              console.log("appendFile error: ", err);
              return;
            }
            return;
          });
        }
      });
    }
  },

  generateId: function(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  updateOrCreateConfig(username, password){
    const directory = process.platform === "win32" ? `${homedir}/appdata/roaming/eccoin` : `${homedir}/.eccoin`;
    const filePath = process.platform === "win32" ? `${homedir}/appdata/roaming/eccoin/eccoin.conf` : `${homedir}/.eccoin/eccoin.conf`;
    return new Promise((resolve, reject) => {
      fs.exists(filePath, (exists) => {
        if(!exists){
           //create
           const toWrite = "maxconnections=100" + os.EOL + "rpcuser=" + username + os.EOL + "rpcpassword=" + password + os.EOL + "addnode=www.cryptounited.io" + os.EOL + "rpcport=19119" + os.EOL + "rpcconnect=127.0.0.1" + os.EOL + "staking=0" + os.EOL + "zapwallettxes=0";
           fsPath.writeFile(filePath, toWrite, 'utf8', (err) => {
                if (err) {
                  console.log(err)
                  resolve(false);
                  return;
                }
                resolve(true);
            });
        }
        else{
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
               console.log("readFile error: ", err);
               resolve(false);
               return;
            }
            var patt = /(rpcuser=(.*))/g
            var myArray = patt.exec(data);
            var result = data;;
            if(myArray && myArray.length > 2)
            {
              result = result.replace('rpcuser='+myArray[2], 'rpcuser='+username);
            }
            else{
              result += `${os.EOL}rpcuser=${username}`;
            }

            patt = /(rpcpassword=(.*))/g
            myArray = patt.exec(data);
            if(myArray && myArray.length > 2)
            {
              result = result.replace('rpcpassword='+myArray[2], 'rpcpassword='+password);
            }
            else{
              result += `${os.EOL}rpcpassword=${password}`;
            }

            fs.writeFile(filePath, result, 'utf8', (err) => {
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
    const directory = process.platform === "win32" ? `${homedir}/appdata/roaming/eccoin` : `${homedir}/.eccoin`;
    const filePath = process.platform === "win32" ? `${homedir}/appdata/roaming/eccoin/eccoin.conf` : `${homedir}/.eccoin/eccoin.conf`;
    var toReturn = null;
    return new Promise((resolve, reject) => {
      fs.exists(filePath, (exists) => {
        if(!exists){
           resolve(toReturn);
           return;
        }
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.log("readFile error: ", err);
            resolve(toReturn);
            return;
          }
          toReturn = {
            username: "",
            password: ""
          }
          var patt = /(rpcuser=(.*))/g
          var myArray = patt.exec(data);
          if(myArray && myArray.length > 2)
          {
            toReturn.username = myArray[2];
          }

          patt = /(rpcpassword=(.*))/g
          myArray = patt.exec(data);
          if(myArray && myArray.length > 2)
          {
            toReturn.password = myArray[2];
          }
          resolve(toReturn);
        });
      })
    });
  }
};

