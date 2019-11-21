import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TweenMax} from 'gsap';
import {Modal, ModalBody, ModalHeader} from 'reactstrap';

import hash from './../router/hash';
import * as actions from '../actions';

import $ from 'jquery';

const Tools = require('../utils/tools');
const os = require('os');
/*
* There are notifications for:
* ECC news (can be deleted) (can be stacked)
* Application update available (permanent notification)
* Staking earnings and earnings from file storage hosting (can be deleted) (can be stacked)
* Messaging (can be deleted) (can be stacked)
* Upcoming payments (permanent notification, until paid or expiration date) (can be stacked)
* File storage running out of space (can be deleted, let user decide when to warn again or something)
*/

class NotificationPopup extends Component {
  constructor() {
    super();
    this.getNotificationsBody = this.getNotificationsBody.bind(this);
    this.getNewsNotifications = this.getNewsNotifications.bind(this);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: false
    };
  }

  toggle () {
    this.setState({
      open: !this.state.open
    })
  }

  componentDidMount() {
    $('#newsNotifications').on('click', () => {
      hash.push('/news');
    });
    $('#earningsNotification').on('click', () => {
      hash.push('/coin/transactions');
      this.props.setTransactionsData(this.props.transactions, 'all');
    });
    $('#applicationUpdate').on('click', () => {
      this.props.setUpdateApplication(true);
    });
    $('#notificationContainer').on('click', (event) => {
      event.stopPropagation();
    });
  }

  componentWillUnmount() {
    $(window).off();
    $('#notificationContainer').off();
  }

  getNotificationsBody() {
    if (this.props.notifications.total === 0 && !this.props.updateAvailable) {
      return (
        <p id="noNotifications" className="notificationsHeaderContentFix">{ this.props.lang.noNotifications }</p>
      );
    }

    return (
      <div>
        {this.getNewsNotifications()}
        {this.getStakingNotifications()}
        {this.getUpdateNotification()}
      </div>
    );
  }

  getUpdateNotification() {
    if (!this.props.updateAvailable) return null;
    const settings = require('../../resources/images/settings-white.png');
    const body = <p>{ this.props.lang.clickToUpdateApp }</p>;
    let className = 'applicationUpdate';
    if (this.props.notifications.differentKinds === 0) {
      className = 'applicationUpdateOnlyNotif';
    }
    return (
      <div className={className} id="applicationUpdate">
        <img src={settings} />
        {body}
      </div>
    );
  }

  getStakingNotifications() {
    if (this.props.notifications.stakingEarnings.total === 0) {
      return null;
    }
    const earnings = Tools.getIconForTheme('overview', false);
    const earningsObject = this.props.notifications.stakingEarnings;
    const totalEarnings = earningsObject.count;
    const date = earningsObject.date;
    let body = <p id="mediumPosts">{ this.props.lang.stakingReward } - {Tools.formatNumber(earningsObject.total)} <span className="ecc">ECC</span></p>;
    const today = new Date();
    const time = Tools.calculateTimeSince(this.props.lang, today, new Date(date));
    if (totalEarnings > 1) { body = <p id="mediumPosts">{totalEarnings} { this.props.lang.stakingRewards } - {Tools.formatNumber(earningsObject.total)} <span className="ecc">ECC</span></p>; }
    return (
      <NotificationItem
        id="earningsNotification"
        image={earnings}
        body={body}
        time={time}
        class={this.props.last === 'earnings' && !this.props.updateAvailable ? 'notificationItem newsItemRoundCorners' : 'notificationItem newsItemBorder'}
      />
    );
  }

  getNewsNotifications() {
    if (this.props.notifications.news.total === 0) {
      return null;
    }
    const news = Tools.getIconForTheme('eccNewsNotif', false); // white ECC logo
    const totalNews = this.props.notifications.news.total;
    const date = this.props.notifications.news.date;
    let newsBody = <p id="mediumPosts">{ this.props.lang.newMediumPost }</p>;
    const today = new Date();
    const time = Tools.calculateTimeSince(this.props.lang, today, new Date(date));
    if (totalNews > 1) { newsBody = <p id="mediumPosts">{totalNews} { this.props.lang.newMediumPosts }</p>; }
    return (
      <NotificationItem
        id="newsNotifications"
        image={news}
        body={newsBody}
        time={time}
        class={this.props.last === 'news' && !this.props.updateAvailable ? 'notificationItem newsItemRoundCorners' : 'notificationItem newsItemBorder'}
      />
    );
  }

  getNotificationsCounter() {
    if (this.props.notifications.total === 0 && !this.props.updateAvailable) {
      return null;
    }
    return (
      <span style={{marginLeft: 5}}>
        ({this.props.updateAvailable ? 1 + this.props.notifications.total : this.props.notifications.total})
      </span>
    );
  }

  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
          { this.props.lang.notifications }
          { this.getNotificationsCounter() }
        </ModalHeader>
        <ModalBody>
          {this.getNotificationsBody()}
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    notifications: state.notifications.entries,
    transactions: state.chains.transactionsData,
    last: state.notifications.entries.last,
    updateAvailable: state.startup.daemonUpdate,
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(NotificationPopup);


class NotificationItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={this.props.class} id={this.props.id}>
        <img src={this.props.image} />
        {this.props.body}
        <p className="timeNews">{this.props.time}</p>
      </div>
    );
  }
}
