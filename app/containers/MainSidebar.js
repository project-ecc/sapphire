import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { BellOutlineIcon, CurrencyUsdIcon, SendIcon, FormatListBulletedIcon, ContactsIcon, ForumIcon, SettingsOutlineIcon, NewspaperIcon } from 'mdi-react';

import * as actions from '../actions';

const Tools = require('../utils/tools');

class MainSidebar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const progressBar = this.props.paymentChainSync;

    const addresses = Tools.getIconForTheme('addresses', false);
    const fileStorage = Tools.getIconForTheme('fileStorage', false);

    const usericon = require('../../resources/images/logo_setup.png');
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
                  <NavLink to="/coin/addresses" activeClassName="active">
                    <img src={addresses} />
                    { this.props.lang.addresses }
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
          <div className="pl-4 pr-4 pt-5 pb-5 text-center" data-tip="View network stats">
            <NavLink to="/coin/network" className="text-white-50">
              <p style={{ fontSize: '13px' }}>{`${this.props.lang.syncing} ${progressBar}%`}</p>
              <div className="progress">
                <div className="bar" style={{ width: `${progressBar}%` }} />
              </div>
              <p style={{ fontSize: '13px' }}>{`${this.props.lang.activeConnections}: ${this.props.connections}`}</p>
            </NavLink>
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
    unlocking: state.application.unlocking,
    sendingEcc: state.application.sendingEcc,
    creatingAddress: state.application.creatingAddress,
    connections: state.chains.connections,
    paymentChainSync: state.chains.paymentChainSync,
    importingPrivateKey: state.application.importingPrivateKey,
    closingApplication: state.application.closingApplication
  };
};

export default connect(mapStateToProps, actions, null, { pure: false })(MainSidebar);
