import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSapphireDirectory } from '../../../utils/platform.service';
import * as actions from '../../../actions';
import Console from './../Console';
import fs from 'fs';

const remote = require('electron').remote;
const app = remote.app;

class Advanced extends Component {
  constructor(props) {
    super(props);

    this.deleteAndReIndex = this.deleteAndReIndex.bind(this);
    this.clearBanlist = this.clearBanlist.bind(this);
  }

  async deleteAndReIndex() {
    const data = await this.props.wallet.walletstop();
    if (data && data === 'ECC server stopping') {
      console.log('stopping daemon');

      const dbLocation = `${getSapphireDirectory()}database.sqlite`;
      console.log(dbLocation);
      try {
        fs.unlinkSync(dbLocation);
        console.log('can read/write');
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
        app.exit(0);
      } catch (err) {
        console.error('no access!');
      }
    }
  }

  async clearBanlist() {
    const data = await this.props.wallet.clearBanned();
    if (data === null) {
      console.log('banlist cleared');
      this.props.setActionPopupResult({ flag: true, successful: true, message: '<p style="margin-bottom: 20px" className="backupFailed">Banlist Cleared!</p>' });
    }
  }

  render() {
    return (
      <div>
        <div className="row settingsToggle" >
          <div className="col-sm-9 text-left removePadding">
            <p>Delete And Reindex</p>
            <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Delete Index Transactions database (WARNING) this will delete your contacts</p>
          </div>
          <div className="col-sm-3 text-right removePadding">
            <p onClick={this.deleteAndReIndex.bind(this)} style={{ cursor: 'pointer' }}>Delete & Relaunch</p>
          </div>
        </div>
        <div className="row settingsToggle">
          <div className="col-sm-6 text-left removePadding">
            <p>Banlist</p>
            <p id="applicationVersion">Click clear banlist to remove all the banned nodes.</p>
          </div>
          <div className="col-sm-6 text-right removePadding">
            <p onClick={this.clearBanlist.bind(this)} style={{ cursor: 'pointer' }}>Clear Banlist</p>
          </div>
        </div>
        <div className="row settingsToggle text-left">
          <div className="col-xs-12" style={{ width: '100%' }}>
            <p>Console</p>
            <Console />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Advanced);
