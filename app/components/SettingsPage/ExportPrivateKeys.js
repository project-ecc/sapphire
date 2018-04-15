import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax, TimelineMax} from "gsap";
import $ from 'jquery';
import { ipcRenderer } from 'electron';
var fs = require('fs');
var jsPDF = require('jspdf');
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';
const Tools = require('../../utils/tools');

class ExportPrivateKeys extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.handlePanels = this.handlePanels.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.generatePDF = this.generatePDF.bind(this);
    this.tween = undefined;
    this.toPrint = [];
    this.displayConfirm = true;
  }

  showWrongPassword(){
    Tools.showTemporaryMessage('#wrongPassword');
  }

  componentWillUnmount(){
    this.props.setPanelExportingPrivateKeys(1);
  }

  handleChange(event) {
    const pw = event.target.value;
    if(pw.length == 0)
      TweenMax.set('#password', {autoAlpha: 1});
    else
      TweenMax.set('#password', {autoAlpha: 0});
    this.props.setPassword(pw);
  }

  handleCancel(){
    this.props.setExportingPrivateKeys(false)
  }

  handlePanels(){
    if(this.props.panelNumber == 1){
      this.displayConfirm = false;
      this.handleConfirm();
    }
    else if(this.props.panelNumber == 2){
      this.handleExportOptions();
      this.displayConfirm = true;
      /*$('#selectedlocation').text("No location selected");
      $('#selectedlocation').css("visibility", "visible");
      $('#selectedlocation').css("color", "#d09128");
      TweenMax.fromTo('#selectedlocation', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
      this.tween = TweenMax.to('#selectedlocation', 0.2, {scale: 0.5, autoAlpha: 0, delay: 3})
      TweenMax.set('#selectedlocation',{scale: 1, delay: 3.2})*/
    }
    else if(this.props.panelNumber == 3){
      this.displayConfirm = true;
      this.export();
    }
    else if(this.props.panelNumber == 4){
      this.handleDisplayKeys()
    }
    /*else if(this.props.panelNumber == 2){
      TweenMax.to('#setLocationPanel', 0.3, {x: "-200%"})
      TweenMax.to('#exportingPanel', 0.3, {x: "-200%"})
      this.props.setPanelExportingPrivateKeys(this.props.panelNumber+1);
      this.animateDots();
      this.export();
    }*/
  }

  animateDots(){
    let t = new TimelineMax({repeat:-1});
    //t.staggerTo('.ecc', 0.2, {autoAlpha: 1}, 0.2)
    //.staggerTo('.ecc', 0.4, {autoAlpha: 0.2}, 0.1)
    t.to('#firstDot', 0.25, {autoAlpha: 1})
    .to('#secondDot', 0.25, {autoAlpha: 1})
    .to('#thirdDot', 0.25, {autoAlpha: 1})
    .to('#firstDot', 0.4, {autoAlpha: 0.2})
    .to('#secondDot', 0.4, {autoAlpha: 0.2, delay: -0.2})
    .to('#thirdDot', 0.4, {autoAlpha: 0.2, delay: -0.2})
  }

  getPasswordPanel(){
    return(
      <div id="passwordPanel" style={{position: "absolute", width: "100%", top: "70px"}}>
        <p style={{fontSize: "16px", width: "450px", margin: "0 auto",textAlign: "justify"}}>{ this.props.lang.exportWarning }</p>
        <div>
        <Input
            divStyle={{width: "400px", marginTop: "15px"}}
            placeholder= { this.props.lang.password }
            placeholderId= "password"
            placeHolderClassName="inputPlaceholder inputPlaceholderUnlock"
            value={this.props.passwordVal}
            handleChange={this.handleChange.bind(this)}
            type="password"
            inputStyle={{width: "400px", top: "20px", marginBottom: "30px"}}
          />
          <p id="wrongPassword" className="wrongPassword">{ this.props.lang.wrongPassword }</p>
        </div>
      </div>
    )
  }

  // getExportingPanel(){
  //   return(
  //     <div id="exportingPanel" style={{position: "absolute", left: "200%", width: "100%", top: "70px"}}>
  //       <p style={{marginTop:"30px"}}>{ this.props.lang.generatingFile }</p>
  //       <span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="firstDot">.</span><span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="secondDot">.</span><span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="thirdDot">.</span>
  //     </div>
  //   )
  // }

  async handleExportOptions(){
    $('#exportPrivKeyButton').text( this.props.lang.export);
    TweenMax.to('#exportOptions', 0.3, {x: "-100%"});

    TweenMax.to('#setLocationPanel', 0.3, {x: "-0%"});
    this.props.setPanelExportingPrivateKeys(this.props.panelNumber+1)
    await this.getDataToExport();
  }

  handleDisplayKeys(){
    TweenMax.to('#exportOptions', 0.3, {x: "-100%"});
    TweenMax.to('#displayKeys', 0.3, {x: "-0%"});

    this.props.setPanelExportingPrivateKeys(this.props.panelNumber+2)
  }

  handleConfirm(){
    let wasStaking = this.props.staking;
    if(this.props.passwordVal == ""){
      this.showWrongPassword();
      return;
    }
    this.unlockWallet(false, 5, async () => {
      TweenMax.to('#passwordPanel', 0.3, {x: "-100%"});
      TweenMax.to('#exportOptions', 0.3, {x: "-0%"});

      this.props.setPanelExportingPrivateKeys(this.props.panelNumber+1);

      if(wasStaking){
          this.unlockWallet(true, 31556926, () => {});
      } else {
        this.props.setStaking(false);
      }
      this.props.setPassword("");
    })
  }

  async getDataToExport(){
    let accounts = await this.getAccounts();
    let addresses = await this.getAddressesOfAccounts(accounts);
    let batch = [];
    let addressesArray = [];
    for(let key in Object.keys(addresses)){
      batch.push({
        method: 'dumpprivkey', parameters: [addresses[key]]
      });
      addressesArray.push(addresses[key]);
    }

    let privKeys = await this.getPrivateKeys(batch);
    let counter = 1;
    let aux = [];

    for(let i = 0; i < addressesArray.length; i++){

      aux.push(addressesArray[i]);
      aux.push(privKeys[i]);
      aux.push("");
      counter++;
      if(counter == 24 || i == addressesArray.length - 1 ){
        this.toPrint.push([]);
        for(let j = 0; j < aux.length; j++)
          this.toPrint[this.toPrint.length-1].push(aux[j]);
        aux.length = 0;
        counter=1;
      }
    }
  }

  unlockWallet(flag, time, callback){
    var batch = [];
    var obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      data = data[0];
      if (data !== null && data.code === -14) {
        this.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
          console.log("daemong ain't working mate :(")
      } else if (data === null) {
          callback();
      } else {
        console.log("error unlocking wallet: ", data)
      }
    }).catch((err) => {
      console.log("err unlocking wallet: ", err);
    });
  }

  export(){
    this.generatePDF();
  }

  generatePDF(){
    let doc = new jsPDF();
    doc.setFontSize(10);
    doc.text(this.toPrint[0], 10, 10);
    for(let i = 1; i < this.toPrint.length; i++){
      doc.addPage();
      doc.text(this.toPrint[i], 10, 10)
    }
    doc.save('printMe.pdf');
    this.toPrint = [];
    this.props.setExportingPrivateKeys(false);
    //this.props.setBackupOperationCompleted(true);
  }

  getPrivateKeys(batch){
    return new Promise((resolve, reject) => {
      this.props.wallet.command(batch).then((data) => {
          resolve(data);
      }).catch((err) => {
          reject(null);
      });
    });
  }

  getAccounts(){
    return new Promise((resolve, reject) => {
      this.props.wallet.listAccounts().then((data) => {
          resolve(data);
      }).catch((err) => {
          reject(null);
      });
    });
  }

  getAddressesOfAccounts(accounts){
    return new Promise((resolve, reject) => {
      var promises = [];
      let keys = Object.keys(accounts);
      for(let i = 0; i < keys.length; i++){
        let promise = this.getAddress(keys[i]);
        promises.push(promise);
      }

      Promise.all(promises).then((data) => {
        let oneArray = [];
        if(data.length > 1)
        {
          for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
              oneArray.push(data[i][j]);
            }
          }
          data = oneArray;
        }
        resolve(data);
      }).catch((err) => {
        console.log("error waiting for all promises: ", err);
        reject(null);
      })
    });
  }

  getAddress(account){
    return new Promise((resolve, reject) => {
      this.props.wallet.getAddressesByAccount(account).then((address) => {
           resolve(address);
      }).catch((err) => {
          console.log("error getting address of account ", err);
          reject(null);
      });
    });
  }

  handleExportClick(){
    ipcRenderer.send('exportPrivateKeys');
    ipcRenderer.on('locationSelected', (event, arg) => {
      if(arg != undefined){
        $('#exportPrivKeyButton').text(this.props.lang.export);
        $('#selectedlocation').text(arg);
        if(this.tween !== undefined)
          this.tween.kill();
        $('#selectedlocation').css("opacity", "1");
        $('#selectedlocation').css("color", "#555d77");
        $('#selectedlocation').css("visibility", "visible");
        this.props.setLocationToExport(arg);
      }
    });
  }

  getLocationToExportPanel(){
    return(
      <div id="setLocationPanel" style={{position: "absolute", left:"100%", width: "100%", top: "52px"}}>
        <p style={{fontSize: "16px", width: "400px", textAlign: "center", margin: "0 auto", paddingTop: "25px", marginBottom:"25px", textAlign: "left"}}>
          { this.props.lang.exportFormat }:
        </p>
        <p className="pdfExample">{`<Public Address>`}</p>
        <p className="pdfExample">{`<Private Key>`}</p>
        <p className="pdfExample">{`<Line Break>`}</p>
      </div>
    )
  }

  renderExportOptions(){
    return(
      <div id="exportOptions" style={{position: "absolute", left:"100%", width: "100%", top: "52px"}}>
        <p style={{fontSize: "16px", width: "400px", textAlign: "center", margin: "0 auto", paddingTop: "25px", marginBottom:"25px", textAlign: "left"}}>
          { this.props.lang.exportFormat }:
        </p>
        <div className="row">
          <div className="col-md-6 left">
            <button  className="buttonPrimary" onClick={this.handleDisplayKeys}>View Keys</button>
          </div>
          <div className="col-md-6 left">
            <button  className="buttonPrimary" onClick={this.handlePanels}>Export Keys To Pdf</button>
          </div>
        </div>

      </div>
    )
  }

  renderdisplayKeys(){
    return(
      <div id="displayKeys" style={{position: "absolute", left:"100%", width: "100%", top: "52px"}}>
        <p style={{fontSize: "16px", width: "400px", textAlign: "center", margin: "0 auto", paddingTop: "25px", marginBottom:"25px", textAlign: "left"}}>
          { this.props.lang.exportFormat }:
        </p>
        <p>Keys will display here.</p>

      </div>
    )
  }

  render() {
     return (
      <div id="exportPrivKey">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.exportPrivateKeys }</p>
        {this.getPasswordPanel()}
        {this.renderExportOptions()}
        {this.getLocationToExportPanel()}
        {this.renderdisplayKeys()}

        <div onClick={this.handlePanels} id= "confirmButtonPopup" className="buttonPrimary" style={{bottom: "10px", left:"205px"}}>{this.props.lang.next}</div>
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    panelNumber: state.application.panelExportPrivateKey,
    locationToExport: state.application.locationToExport,
    sideBarHidden: state.sideBar.sidebarHidden,
    wallet: state.application.wallet,
    staking: state.chains.staking,
  };
};


export default connect(mapStateToProps, actions)(ExportPrivateKeys);
