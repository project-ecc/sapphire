import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getSapphireDirectory} from '../../utils/platform.service';
import * as actions from '../../actions/index';
import Console from './partials/Console';
import fs from 'fs';
import {SettingsIcon} from 'mdi-react';
import {Button} from 'reactstrap';
import Header from '../Others/Header';
import Body from '../Others/Body';
import ActionModal from '../Others/ActionModal';
import {clearTransactions} from '../../Managers/SQLManager'

const remote = require('electron').remote;
const app = remote.app;
const event = require('../../utils/eventhandler');

class Advanced extends Component {
  constructor(props) {
    super(props);

    this.deleteAndReIndex = this.deleteAndReIndex.bind(this);
    this.clearBanlist = this.clearBanlist.bind(this);
    this.openConsole = this.openConsole.bind(this);
  }

  async deleteAndReIndex() {
      try {
        let deleted = await clearTransactions();
        this.reindex.getWrappedInstance().toggle();
        event.emit('loadTransactions');
      } catch (err) {
        console.error('no access!', err);
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
              <p className="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Delete Index Transactions database</p>
            </div>
            <div className="col-sm-3 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.deleteAndReIndex()}>Reindex</Button>
            </div>
          </div>
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>Banlist</p>
              <p id="walletBackupOptions" style={{ fontSize: '14px', fontWeight: '700' }}>Click clear banlist to remove all the banned nodes.</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.clearBanlist()}>Clear Ban list</Button>
            </div>
          </div>
          <div className="row settingsToggle">
            <div className="col-sm-6 text-left removePadding">
              <p>{ this.props.lang.console }</p>
            </div>
            <div className="col-sm-6 text-right removePadding">
              <Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.openConsole()}>{ this.props.lang.accessConsole }</Button>
            </div>
          </div>
        </Body>

        <ActionModal ref={(e) => { this.clearedBanlist = e; }} body={this.props.lang.banlistCleared} />
        <ActionModal ref={(e) => { this.reindex = e; }} body="Reindexing!" />
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
