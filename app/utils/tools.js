const homedir = require('os').homedir();
const fs = require('fs');
const os = require('os');
import {TweenMax} from "gsap";
import $ from 'jquery';

module.exports = {
  formatNumber: function (number) {
    return number.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits: 8})
  },

  //Animations

  showTemporaryMessage: function (element, text) {
    if(text){
      $(element).text(text)
    }

    TweenMax.to(element, 0.2, {autoAlpha: 1, scale: 1, onComplete: () => {
      setTimeout(() => {
        TweenMax.to(element, 0.2, {autoAlpha: 0, scale: 0.5});
      }, 2000)
    }});
  },

  highlightInput: function(element, duration){
      TweenMax.to(element, 0.3, {css:{borderBottom: "2px solid #d09128"}});
      TweenMax.to(element, 0.3, {css:{borderBottom: "2px solid #1c2340"}, delay: duration});
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
  }
};

