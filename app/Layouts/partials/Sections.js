import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { SettingsIcon, BitcoinIcon, NewspaperIcon, BellOutlineIcon } from 'mdi-react';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import * as actions from '../../actions/index';
import NotificationPopup from '../../components/NotificationPopup';

class Sections extends Component {
  constructor (props) {
    super(props);

    this.openNotifications = this.openNotifications.bind(this);
  }

  openNotifications() {
    this.notificationModal.getWrappedInstance().toggle();
  }

  render() {
    let numberOfNotifications = this.props.notifications.total;
    if (this.props.updateAvailable) { numberOfNotifications += 1; }

    return (
      <div className="sections">
        <div>
          <NavLink to="/coin" activeClassName="active" data-tip={this.props.lang.default}>
            <BitcoinIcon size={35} />
          </NavLink>
        </div>
        <div>
          <a data-tip={`${this.props.lang.notifications} ${numberOfNotifications > 0 ? `(${numberOfNotifications})` : ''}`} onClick={this.openNotifications} className={numberOfNotifications > 0 ? 'highlight' : ''}>
            <BellOutlineIcon size={35} />
          </a>
          <NavLink to="/news" activeClassName="active" data-tip={this.props.lang.eccNews}>
            <NewspaperIcon size={35} />
          </NavLink>
          <NavLink to="/settings" activeClassName="active" data-tip={this.props.lang.settings}>
            <SettingsIcon size={35} />
          </NavLink>
        </div>
        <ReactTooltip />
        <NotificationPopup ref={(e) => (this.notificationModal = e)} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    updateAvailable: state.startup.guiUpdate || state.startup.daemonUpdate,
    notifications: state.notifications.entries
  };
};

export default withRouter(connect(mapStateToProps, actions)(Sections));
