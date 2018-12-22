import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../actions';
import { SettingsIcon } from 'mdi-react';

import ExportPrivateKeysModal from './../partials/ExportPrivateKeysModal';
import ChangePasswordModal from './../partials/ChangePasswordModal';
import ImportPrivateKeysModal from './../partials/ImportPrivateKeysModal';

import Header from './../../Others/Header';
import Body from './../../Others/Body';

const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

class Wallet extends Component {
  constructor(props) {
    super(props);

    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);
    this.handleExportPrivateKeys = this.handleExportPrivateKeys.bind(this);
    this.handleChangePasswordClicked = this.handleChangePasswordClicked.bind(this);
    this.handleImportPrivateKey = this.handleImportPrivateKey.bind(this);
  }

  onClickBackupLocation() {
    if(this.props.backingUpWallet) return;
    this.props.setBackupOperationInProgress(true);
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        this.props.setBackupOperationInProgress(false);
        return;
      }
      let walletpath;

      var backupLocation = `${folderPaths}/walletBackup.dat`;
      this.backupWallet(backupLocation);
    });
  }

  handleExportPrivateKeys(){
    this.modal.getWrappedInstance().toggle();
  }

  handleChangePasswordClicked(){
    this.passwordModal.getWrappedInstance().toggle();
  }

  handleImportPrivateKey(){
    this.importKeysModal.getWrappedInstance().toggle();
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.wallet }
        </Header>
        <Body>
          <p id="walletBackup">{ this.props.lang.backup }</p>
          <p id="walletBackupExplanation">{ this.props.lang.backupExplanation }</p>
          <div className="row" style={{ marginTop: '30px', marginBottom: '30px' }}>
            <div className="col-sm-6 text-center">
              <p className="buttonTransaction settingsButtonBackup" onClick={this.onClickBackupLocation}>{ this.props.lang.backup } wallet.dat</p>
            </div>
            <div className="col-sm-6 text-center">
              <p className="buttonTransaction settingsButtonBackup" onClick={this.handleExportPrivateKeys}>{ this.props.lang.exportPrivateKeys }</p>
            </div>
          </div>
          <div className="container">
            <div className="row settingsToggle">
              <div className="col-sm-10 text-left removePadding">
                <p className="walletBackupOptions">{ this.props.lang.password }</p>
              </div>
              <div className="col-sm-2 text-right removePadding">
                <p onClick={this.handleChangePasswordClicked} style={{ cursor: 'pointer' }}>{ this.props.lang.change }</p>
              </div>
            </div>
            <div className="row settingsToggle" >
              <div className="col-sm-10 text-left removePadding">
                <p className="walletBackupOptions">{ this.props.lang.privateKey }</p>
              </div>
              <div className="col-sm-2 text-right removePadding">
                <p onClick={this.handleImportPrivateKey} style={{ cursor: 'pointer' }}>{ this.props.lang.import }</p>
              </div>
            </div>

            {/* <div className="row settingsToggle"> */}
            {/* <div className="col-sm-6 text-left removePadding"> */}
            {/* <p>{ this.props.lang.wallet }</p> */}
            {/* <p id="applicationVersion">{this.props.lang.walletImportInfo}</p> */}
            {/* </div> */}
            {/* <div className="col-sm-6 text-right removePadding"> */}
            {/* <p onClick={this.handleImportWalletFile} style={{cursor: "pointer"}}>{ this.props.lang.import }</p> */}
            {/* </div> */}
            {/* </div> */}
          </div>
        </Body>
        <ExportPrivateKeysModal ref={(e) => { this.modal = e; }} />
        <ChangePasswordModal ref={(e) => { this.passwordModal = e; }} />
        <ImportPrivateKeysModal ref={(e) => { this.importKeysModal = e; }} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    backingUpWallet: state.application.backingUpWallet
  };
};

export default connect(mapStateToProps, actions)(Wallet);
