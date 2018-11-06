import React, { Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import { NavLink } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { MenuIcon, CurrencyUsdIcon, SendIcon, FormatListBulletedIcon, ContactsIcon, ForumIcon, SettingsOutlineIcon, NewspaperIcon } from 'mdi-react';

import * as actions from '../actions';
const Tools = require('../utils/tools');

class Sidebar extends Component {
  render() {
    const progressBar = this.props.paymentChainSync;

    let addresses = Tools.getIconForTheme('addresses', false);
    let fileStorage = Tools.getIconForTheme('fileStorage', false);

    const usericon = require('../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="d-flex flex-column justify-content-between" style={{minHeight: '100%'}}>
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
                  <NavLink to="/" exact activeClassName="active">
                    <CurrencyUsdIcon size={20} />
                    { this.props.lang.overview }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/send" activeClassName="active">
                    <SendIcon size={20} />
                    { this.props.lang.send }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/addresses" activeClassName="active">
                    <img src={addresses} />
                    { this.props.lang.addresses }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/transactions" activeClassName="active">
                    <FormatListBulletedIcon size={20} />
                    { this.props.lang.transactions }
                  </NavLink>
                </li>
              </ul>
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.services }</a>
                </li>
                {/*<li>*/}
                  {/*<NavLink to="/files">*/}
                    {/*<img src={fileStorage} />*/}
                    {/*{ this.props.lang.fileStorage }*/}
                    {/*</NavLink>*/}
                {/*</li>*/}
                {/*<li>*/}
                  {/*<NavLink to="/messages">*/}
                    {/*<ForumIcon size={20} />*/}
                    {/*{ this.props.lang.messaging }*/}
                  {/*</NavLink>*/}
                {/*</li>*/}
                <li>
                  <NavLink to="/contacts">
                    <ContactsIcon size={20} />
                    { this.props.lang.contacts }
                  </NavLink>
                </li>
              </ul>
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.default }</a>
                </li>
                <li>
                  <NavLink to="/news">
                    <NewspaperIcon size={20} />
                    { this.props.lang.eccNews }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings">
                    <SettingsOutlineIcon size={20} />
                    { this.props.lang.settings }
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="connections sidebar-section-container">
            <NavLink to="/network" data-tip="View network stats" data-id="network">
              <p style={{ fontSize: '13px' }}>{`${this.props.lang.syncing} ${progressBar}%`}</p>
              <div className="progress">
                <div className="bar" style={{ width: `${progressBar}%` }} />
              </div>
              <p style={{ fontSize: '13px' }}>{`${this.props.lang.activeConnections}: ${this.props.connections}`}</p>
            </NavLink>
            <ReactTooltip />
          </div>
        </div>
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

export default connect(mapStateToProps, actions, null, { pure: false })(Sidebar);
