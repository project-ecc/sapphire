'use strict';
const { ipcRenderer } = require('electron');

window.onload = function () {
  ipcRenderer.on('background-start', (startTime) => {
    while(true){
      console.log('in here');
    }

  });
};
