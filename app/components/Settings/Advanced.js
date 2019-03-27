import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSapphireDirectory } from '../../utils/platform.service';
import * as actions from '../../actions/index';
import Console from './partials/Console';
import fs from 'fs';
import { SettingsIcon } from 'mdi-react';

const remote = require('electron').remote;
const app = remote.app;

import Header from '../Others/Header';
import Body from '../Others/Body';
import ActionModal from '../Others/ActionModal';

class Advanced extends Component {
  constructor(props) {
    super(props);

    this.deleteAndReIndex = this.deleteAndReIndex.bind(this);
    this.clearBanlist = this.clearBanlist.bind(this);
    this.openConsole = this.openConsole.bind(this);
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
      this.clearedBanlist.getWrappedInstance().toggle();
    }
  }

  openConsole () {
    this.consoleModal.getWrappedInstance().toggle();
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.advanced }
        </Header>
        <Body>
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
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>{ this.props.lang.console }</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              <p onClick={this.openConsole} style={{ cursor: 'pointer' }}>{ this.props.lang.accessConsole }</p>
            </div>
          </div>
        </Body>

        <ActionModal ref={(e) => { this.clearedBanlist = e; }} body={this.props.lang.banlistCleared} />
        <Console ref={(e) => { this.consoleModal = e; }} />
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
