import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
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
  }
  
 componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {

  }
  
  componentWillEnter (callback) {
    callback();
  }
  
  componentDidEnter(callback) {
    tools.animatePopupIn(this.refs.second, callback, "30%");
  }

  componentWillLeave (callback) {
    tools.animatePopupOut(this.refs.second, callback)
  }
  
  componentDidLeave(callback) {
  }  

  componentDidMount(){
    var self = this;
    $('#notificationNews').on("click", function(){
      self.props.setSelectedPanel("news");
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
    if(this.props.notifications["total"] == 0){
      return(
        <p id="noNotifications">You have no notifications</p>
      )
    }
    else{
      return(
        <div>
          {this.getNewsNotifications()}
        </div>
      )
    }
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
      <div id="notificationNews">
       <img src={news}/>
        {newsBody}
        <p className="timeNews">{time}</p>
      </div>
    )
  }

  getNotificationsCounter(){
    if(this.props.notifications["total"] == 0){
      return null;
    }
    return(
      <div id="notificationCounter">
        {this.props.notifications["total"]}
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
    notifications: state.notifications.entries
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(NotificationPopup));