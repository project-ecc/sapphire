import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import {ContactsIcon, CurrencyUsdIcon, DownloadIcon, FormatListBulletedIcon, GiftIcon, SendIcon} from 'mdi-react';
import {Button, Col, Progress, Row} from 'reactstrap';
import Dot from './../../components/Others/Dot';
import UnlockModal from './../../components/Others/UnlockModal';

import * as actions from '../../actions/index';

class MainSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = { staking: this.props.staking };
    this.processStakingClicked = this.processStakingClicked.bind(this);
    this.lockWallet = this.lockWallet.bind(this);
    this.startStaking = this.startStaking.bind(this);
  }

  processStakingClicked() {
    if (!this.props.staking) {
      this.unlockModal.getWrappedInstance().toggle();
    } else {
      this.lockWallet().then(() => {
        this.props.wallet.setGenerate().then(() => {
          this.setState({
            staking: false
          });
          this.props.setStaking(false);
        });
      });
    }
  }

  async lockWallet() {
    const batch = [];
    const obj = {
      method: 'walletlock', parameters: []
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      console.log('data: ', data);
      data = data[0];
      if (data !== null && data.code === 'ECONNREFUSED') {
        console.log('daemon not working?');
      } else if (data !== null) {
        console.log('error unlocking wallet: ', data);
      }
    }).catch((err) => {
      console.log('err unlocking wallet: ', err);
    });
  }

  startStaking () {
    this.props.wallet.setGenerate().then(() => {
      this.setState({
        staking: true
      });
      setTimeout(() => this.props.setStaking(true), 1000);
    });
  }

  render() {
    const progressBar = this.props.paymentChainSync;

    const usericon = require('../../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="d-flex flex-column justify-content-between" style={{ minHeight: '100%' }}>
          <div>
            <div className="userimage">
              <img id="sidebarLogo" src={usericon} />
            </div>
            <div className="menu">
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.wallet }</a>
                </li>
                <li>
                  <NavLink to="/coin" exact activeClassName="active">
                    <CurrencyUsdIcon size={20} />
                    { this.props.lang.overview }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/coin/send" activeClassName="active">
                    <SendIcon size={20} />
                    { this.props.lang.send }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/coin/receive" activeClassName="active">
                    <DownloadIcon size={20} />
                    { this.props.lang.receive }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/coin/transactions" activeClassName="active">
                    <FormatListBulletedIcon size={20} />
                    { this.props.lang.transactions }
                  </NavLink>
                </li>
              </ul>
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.services }</a>
                </li>
                <li>
                  <NavLink to="/coin/contacts">
                    <ContactsIcon size={20} />
                    { this.props.lang.contacts }
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-5 pb-2">
            <NavLink to="/coin/network" className="text-center pl-4 pr-4" data-tip="View network stats">
              <div style={{ fontSize: '13px' }}>{`${this.props.lang.syncing} ${progressBar}%`}</div>
              <Progress animated striped value={progressBar} color="success" className="mt-2 mb-2" style={{borderRadius: 0, height: 6}} />
              <div style={{ fontSize: '13px' }}>{`${this.props.lang.activeConnections}: ${this.props.connections}`}</div>
            </NavLink>
            <div className="menu mt-0 mb-2 pl-2 pr-2 text-center">
              <Dot size={10} color={this.props.daemonRunning ? 'success' : 'danger'} />
              { this.props.daemonRunning && (<small className="text-success">
                { this.props.lang.blockchainConnected}
              </small>) }
              { !this.props.daemonRunning && (<small className="text-danger">
                { this.props.lang.blockchainDisconnected }
              </small>) }
            </div>
            <div className="menu mt-0">
              <ul>
                <li>
                  <NavLink to="/settings/donate" className="bg-dark">
                    <GiftIcon size={20} />
                    { this.props.lang.donate }
                  </NavLink>
                </li>
                { this.props.balance > 0 && this.props.initialDownload == false && (
                  <li>
                    <Row className="bg-dark" style={{paddingBottom: '5px'}}>
                      <Col style={{marginLeft: '25px'}}>Staking</Col>
                      <Col ><Button style={{marginLeft: '25px'}} size="sm" outline color="warning" onClick={() => this.processStakingClicked()} active={this.state.staking === true}>{this.state.staking ? "On" : "Off"}</Button></Col>
                    </Row>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <UnlockModal ref={(e) => { this.unlockModal = e; }} onUnlock={this.startStaking}>
          <p>{`${this.props.lang.unlockWalletExplanation1} ${this.props.lang.unlockWalletExplanation2}`} <span className="ecc">ECC</span>.</p>
        </UnlockModal>
        <ReactTooltip />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    connections: state.chains.connections,
    paymentChainSync: state.chains.paymentChainSync,
    daemonRunning: state.application.daemonRunning,
    wallet: state.application.wallet,
    initialDownload: state.chains.initialDownload
  };
};

export default connect(mapStateToProps, actions, null, { pure: false })(MainSidebar);
