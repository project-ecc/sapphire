import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { CurrencyUsdIcon, SendIcon, FormatListBulletedIcon, ContactsIcon, DownloadIcon, GiftIcon } from 'mdi-react';

import * as actions from '../../actions/index';

class MainSidebar extends Component {
  constructor(props) {
    super(props);
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
              <div className="progress">
                <div className="bar" style={{ width: `${progressBar}%` }} />
              </div>
              <div style={{ fontSize: '13px' }}>{`${this.props.lang.activeConnections}: ${this.props.connections}`}</div>
            </NavLink>
            <div className="menu mt-0 mb-2 pl-4 pr-4 text-center">
              { this.props.daemonRunning && (<span className="text-green">Daemon Running</span>) }
              { !this.props.daemonRunning && (<span className="text-warning">Daemon Stopped</span>) }
            </div>
            <div className="menu mt-0">
              <ul>
                <li>
                  <NavLink to="/settings/donate" className="bg-dark">
                    <GiftIcon size={20} />
                    { this.props.lang.donate }
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
    daemonRunning: state.application.daemonRunning
  };
};

export default connect(mapStateToProps, actions, null, { pure: false })(MainSidebar);
