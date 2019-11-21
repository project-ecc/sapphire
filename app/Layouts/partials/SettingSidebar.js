import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import {FacebookIcon, MediumIcon, RedditIcon, SlackIcon, TwitterIcon, DiscordIcon} from 'mdi-react';

import * as actions from '../../actions/index';

const Tools = require('../../utils/tools');

class SettingSidebar extends Component {
  constructor(props) {
    super(props);

    this.openNotifications = this.openNotifications.bind(this);
  }

  openNotifications() {
    this.notificationModal.getWrappedInstance().toggle();
  }

  goToUrl(url) {
    open(url);
  }

  render() {
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
                  <a className="subheading">{ this.props.lang.appSettings }</a>
                </li>
                <li>
                  <NavLink to="/settings" exact activeClassName="active">
                    { this.props.lang.general }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/wallet" activeClassName="active">
                    { this.props.lang.wallet }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/notifications" activeClassName="active">
                    { this.props.lang.notifications }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/appearance" activeClassName="active">
                    { this.props.lang.appearance }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/language" activeClassName="active">
                    { this.props.lang.language }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/donate" activeClassName="active">
                    { this.props.lang.donate }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/advanced" activeClassName="active">
                    { this.props.lang.advanced }
                  </NavLink>
                </li>
                <li>
                  <div className="social ml-4">
                    <TwitterIcon onClick={this.goToUrl.bind(this, "https://twitter.com/project_ecc")} size={20} />
                    <FacebookIcon onClick={this.goToUrl.bind(this, "https://www.facebook.com/projectECC/")} size={20} />
                    <MediumIcon onClick={this.goToUrl.bind(this, "https://medium.com/@project_ecc")} size={20} />
                    <RedditIcon onClick={this.goToUrl.bind(this, "https://www.reddit.com/r/ecc/")} size={20} />
                    <DiscordIcon onClick={this.goToUrl.bind(this, "https://discord.gg/v8XvRyW")} size={20} />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions, null, { pure: false })(SettingSidebar);
