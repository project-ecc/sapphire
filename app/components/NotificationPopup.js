import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
const Tools = require('../utils/tools')

/*
* There are notifications for:
* ECC news (can be deleted) (can be stacked)
* Application update available (permanent notification)
* Staking earnings and earnings from file storage hosting (can be deleted) (can be stacked)
* Messaging (can be deleted) (can be stacked)
* Upcoming payments (permanent notification, until paid or expiration date) (can be stacked)
* File storage running out of space (can be deleted, let user decide when to warn again or something)
*/

class NotificationPopup extends React.Component {
 constructor() {
    super();
    this.getNotificationsBody = this.getNotificationsBody.bind(this);
    this.getNewsNotifications = this.getNewsNotifications.bind(this);
    this.handleHoverAnsPayments = this.handleHoverAnsPayments.bind(this);
    this.handleHoverOutAnsPayments = this.handleHoverOutAnsPayments.bind(this);
  }

  componentDidMount(){
    var self = this;
    $('#newsNotifications').on("click", function(){
      self.props.setSelectedPanel("news");
      self.props.setNotifications(false);
      self.props.selectedSideBar(undefined);
      self.props.setShowingNews(true);
    });
    $('#earningsNotification').on("click", function(){
      self.props.setSelectedPanel("transactions");
      self.props.setTransactionsData(self.props.transactions, "generate");
      self.props.selectedSideBar("transactions");
      self.props.setNotifications(false);
    });
    $('#applicationUpdate').on("click", function(){

      self.props.setNotifications(false);
    });
    $('#notificationContainer').on("click", function(event) {
      event.stopPropagation();
    });
    var self = this;
    setTimeout(() => {
      self.subscribeToEvent();
    }, 100);
  }

  subscribeToEvent(){
    var self = this;
    $(window).on("click", function() {
      self.props.setNotifications(false)
    });
  }

  componentWillUnmount(){
    $(window).off();
    $('#notificationContainer').off();
  }

  handleCancel(){
    this.props.setUnlocking(false);
  }
  
  getNotificationsBody(){
    var self = this;
    if(this.props.notifications["total"] == 0 && !this.props.updateAvailable){
      return(
        <p id="noNotifications">You have no notifications</p>
      )
    }
    else{
      return(
        <div id="notificationsBody">
          {this.getNewsNotifications()}
          {this.getStakingNotifications()}
          {this.getAnsIncomingPayments()}
          {this.getUpdateNotification()}
        </div>
      )
    }
  }

  handleHoverAnsPayments(){
    TweenMax.fromTo('#payAns', 0.3, {autoAlpha:0, scale:0.5}, {autoAlpha: 1, scale:1})
  }

  handleHoverOutAnsPayments(){
    TweenMax.fromTo('#payAns', 0.3, {autoAlpha:1, scale: 1}, {autoAlpha: 0, scale:0.5})
  }

  getAnsIncomingPayments(){
    if(this.props.notifications["ansPayments"]["payments"].count == 0){
      return null;
    }
    let earnings = require('../../resources/images/overview-blue.png');
    var ansPaymentsObject = this.props.notifications["ansPayments"];
    var totalAnsPayments = ansPaymentsObject["payments"].count;
    var date = ansPaymentsObject["firstDueDate"];
    console.log(date)
    var body = <p id="mediumPosts">ANS Payment - {Tools.formatNumber(ansPaymentsObject["payments"][0]["cost"])} <span className="ecc">ECC</span></p>
    const today = new Date();
    let time = Tools.calculateTimeSince(this.props.lang, today, new Date(date));
    if(totalAnsPayments > 1)
     body = <p id="mediumPosts">{totalAnsPayments} ANS Payments - {Tools.formatNumber(ansPaymentsObject["payments"][0]["cost"])} <span className="ecc">ECC</span></p>
    return(
      <div style={{position: "relative"}} onMouseEnter={this.handleHoverAnsPayments} onMouseLeave={this.handleHoverOutAnsPayments}>
        <NotificationItem 
          id="ansPaymentsNotification"
          handleMouseIn={this.props.handleHoverPayments}
          image = {earnings}
          body = {body}
          time = "in 4 days" 
          class = {this.props.last == "incomingStakingPayments" && !this.props.updateAvailable ? "notificationItem newsItemRoundCorners resetCursor" : "notificationItem newsItemBorder resetCursor" }/>
          <div id="payAns">
            <p>{totalAnsPayments > 1 ? "Extend ANS subscriptions" : "Extend ANS subscription"}</p>
          </div>
        </div>
    )
  }

  getUpdateNotification(){
    if(!this.props.updateAvailable) return null;
    let settings = require('../../resources/images/settings-white.png'); 
    let body = <p>Click to update your application</p>
    let className = "applicationUpdate";
    if(this.props.notifications["differentKinds"] == 0){
      className = "applicationUpdateOnlyNotif"
    }
    return(
      <div className={className} id="applicationUpdate">
       <img src={settings}/>
        {body}
      </div>
    )
  }

  getStakingNotifications(){
    if(this.props.notifications["stakingEarnings"].total == 0){
      return null;
    }
    let earnings = require('../../resources/images/overview-blue.png');
    var earningsObject = this.props.notifications["stakingEarnings"];
    var totalEarnings = earningsObject.count;
    var date = earningsObject.date;
    var body = <p id="mediumPosts">Staking reward - {Tools.formatNumber(earningsObject["total"])} <span className="ecc">ECC</span></p>
    const today = new Date();
    let time = Tools.calculateTimeSince(this.props.lang, today, new Date(date));
    if(totalEarnings > 1)
     body = <p id="mediumPosts">{totalEarnings} Staking rewards - {Tools.formatNumber(earningsObject["total"])} <span className="ecc">ECC</span></p>
    return(
      <NotificationItem 
        id="earningsNotification"
        image = {earnings}
        body = {body}
        time = {time} 
        class = {this.props.last == "earnings" && !this.props.updateAvailable ? "notificationItem newsItemRoundCorners" : "notificationItem newsItemBorder" }/>
    )
  }

  getNewsNotifications(){
    if(this.props.notifications["news"].total == 0){
      return null;
    }
    let news = require('../../resources/images/news-white.png');
    var totalNews = this.props.notifications["news"].total;
    var date = this.props.notifications["news"].date;
    var newsBody = <p id="mediumPosts">New ECC medium post</p>
    const today = new Date();
    let time = Tools.calculateTimeSince(this.props.lang, today, new Date(date));
    if(totalNews > 1)
      newsBody = <p id="mediumPosts">{totalNews} New ECC medium posts</p>
    return(
      <NotificationItem 
        id="newsNotifications"
        image = {news}
        body = {newsBody}
        time = {time}
        class = {this.props.last == "news" && !this.props.updateAvailable ? "notificationItem newsItemRoundCorners" : "notificationItem newsItemBorder" }/>
    )
  }

  getNotificationsCounter(){
    if(this.props.notifications["total"] == 0 && !this.props.updateAvailable){
      return null;
    }
    return(
      <div id="notificationCounter">
        <p>{this.props.updateAvailable ? 1 + this.props.notifications["total"] : this.props.notifications["total"]}</p>
      </div>
    )
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second">
        <div id="notificationContainer">
          <div id="notificationHeader">
            <div id="notificationsHeaderContent">
            <p>Notifications</p>
            {this.getNotificationsCounter()}
          </div>
          </div>
          {this.getNotificationsBody()}
        </div>
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    notifications: state.notifications.entries,
    transactions: state.chains.transactionsData,
    last: state.notifications.entries["last"],
    updateAvailable: state.startup.guiUpdate || state.startup.daemonUpdate,
  };
};


export default connect(mapStateToProps, actions)(NotificationPopup);


class NotificationItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={this.props.class} id={this.props.id}>
       <img src={this.props.image}/>
        {this.props.body}
        <p className="timeNews">{this.props.time}</p>
      </div>
    );
  }
}