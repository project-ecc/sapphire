import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import { TweenMax } from 'gsap';
import { ipcRenderer } from 'electron';
import { Button } from 'reactstrap';

class ImportWallet extends React.Component {
  constructor() {
    super();
    this.openFile = this.openFile.bind(this);
    this.sendActionImportCancelled = this.sendActionImportCancelled.bind(this);
    this.sendActionImportedWallet = this.sendActionImportedWallet.bind(this);
    this.sendActionImportStarted = this.sendActionImportStarted.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('importedWallet', this.sendActionImportedWallet);
    ipcRenderer.on('importStarted', this.sendActionImportStarted);
    ipcRenderer.on('importCancelled', this.sendActionImportCancelled);
  }

  sendActionImportedWallet() {
    if (this.props.setupDone) {
      this.props.setImportingWalletWithSetupDone(true);
    }
    this.props.importedWallet();
    TweenMax.to('#importing', 0.2, { autoAlpha: 0, scale: 0.5 });
    TweenMax.fromTo('#imported', 0.2, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1 });
  }

  sendActionImportCancelled() {
    this.props.importCancelled();
  }

  sendActionImportStarted() {
    this.props.importStarted();
    TweenMax.to('#import', 0.2, { autoAlpha: 0, scale: 0.5 });
    TweenMax.to('#importing', 0.2, { autoAlpha: 1, scale: 1 });
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('importedWallet', this.sendActionImportedWallet);
    ipcRenderer.removeListener('importStarted', this.sendActionImportStarted);
    ipcRenderer.removeListener('importCancelled', this.sendActionImportCancelled);

    if (this.props.shouldImportWallet) {
      this.props.setImportWalletTemporary({ importWalletTemp: true, importWallet: false });
    }
  }

  openFile() {
    if (this.props.importing) { return; }
    this.props.importingWallet();
    ipcRenderer.send('importWallet');
  }

  toRender() {
    return (
      <div>
        <div id="import">
          <Button onClick={this.openFile}>
            { this.props.lang.import }
          </Button>
        </div>
        <div style={{ fontWeight: '300' }} id="importing">
          { this.props.lang.importingYourWallet }
        </div>
        <div style={{ fontWeight: '300' }} id="imported">
          { this.props.lang.imported }
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.toRender()}
      </div>
    );
  }

}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    importing: state.setup.importing,
    importHasStarted: state.setup.importStarted,
    setupDone: state.startup.setupDone,
    shouldImportWallet: state.startup.importWallet
  };
};


export default connect(mapStateToProps, actions)(ImportWallet);
