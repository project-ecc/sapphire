import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import * as actions from '../../../actions';
import SettingsToggle from './../SettingsToggle';

const settings = require('electron').remote.require('electron-settings');

class Notifications extends Component {
  constructor(props) {
    super(props);

    this.handleOperativeSystemNotifications = this.handleOperativeSystemNotifications.bind(this);
    this.handleNewsNotifications = this.handleNewsNotifications.bind(this);
    this.handleStakingNotifications = this.handleStakingNotifications.bind(this);
  }

  handleOperativeSystemNotifications() {
    this.reloadSettings('notifications.operative_system', !this.props.operativeSystemNotifications);
    this.props.setOperativeSystemNotifications(!this.props.operativeSystemNotifications);
  }

  handleNewsNotifications() {
    if (this.props.newsNotifications === true) {
      this.props.setNewsChecked();
    }
    this.reloadSettings('notifications.news', !this.props.newsNotifications);
    this.props.setNewsNotifications(!this.props.newsNotifications);
  }

  handleStakingNotifications() {
    if (this.props.stakingNotifications === true) {
      this.props.setEarningsChecked();
    }
    this.reloadSettings('notifications.staking', !this.props.stakingNotifications);
    this.props.setStakingNotifications(!this.props.stakingNotifications);
  }

  reloadSettings(settingPath, value) {
    settings.set(`settings.${settingPath}`, value);
    ipcRenderer.send('reloadSettings');
  }

  render() {
    return (
      <div>
        <SettingsToggle
          keyVal={2}
          text={this.props.lang.operativeSystemNotifications}
          subText={this.props.operativeSystemNotifications ? <p className="settingsToggleSubText">{ this.props.lang.operativeSystemNotificationDisable }</p> : <p className="settingsToggleSubText">{ this.props.lang.operativeSystemNotificationEnable }</p>}
          handleChange={this.handleOperativeSystemNotifications}
          checked={this.props.operativeSystemNotifications}
        />
        <SettingsToggle
          keyVal={3}
          text={<p>{ this.props.lang.eccNewsNotificationsFrom } <span className="mediumToggle" onClick={this.handleMediumClick}>Medium</span></p>}
          handleChange={this.handleNewsNotifications}
          checked={this.props.newsNotifications}
        />
        <SettingsToggle
          keyVal={1}
          text={this.props.lang.stakingNotifications}
          subText={this.props.stakingNotifications ? <p className="settingsToggleSubText">{ this.props.lang.stakingNotificationsDisable }</p> : <p className="settingsToggleSubText">{ this.props.lang.stakingNotificationsEnable }</p>}
          handleChange={this.handleStakingNotifications}
          checked={this.props.stakingNotifications}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    operativeSystemNotifications: state.notifications.operativeSystemNotificationsEnabled,
    newsNotifications: state.notifications.newsNotificationsEnabled,
    stakingNotifications: state.notifications.stakingNotificationsEnabled
  };
};

export default connect(mapStateToProps, actions)(Notifications);
