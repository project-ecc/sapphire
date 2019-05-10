import React, {Component} from 'react';
import moment from 'moment';
import hash from '../router/hash';
import * as tools from '../utils/tools';
import {connect} from "react-redux";
import * as actions from "../actions";

import $ from 'jquery';

const event = require('../utils/eventhandler');
const https = require('https');
const FeedMe = require('feedme');
const request = require('request');

class News extends Component {
  constructor(props) {
    super(props);

    this.newsFeedCycle = this.newsFeedCycle.bind(this);
    this.startCycle = this.startCycle.bind(this);
    this.queueOrSendNotification = this.queueOrSendNotification.bind(this);

    this.state = {
      // Check for news every 2 hours (user can refresh manually too)
      eccNewsInterval: 7200000,
      eccNewsTimer: null,

      goalInterval: 120000,
      goalTimer: null
    };

    this.listenToEvents();
  }

  componentWillUnmount() {
    clearInterval(this.state.eccNewsTimer);
    event.removeListener('startConnectorChildren');
  }

  listenToEvents() {
    event.on('startConnectorChildren', this.startCycle);
  }

  async startCycle() {
    // Fetch the news first.. then start the interval for checking every x milliseconds
    await this.newsFeedCycle();

    this.setState({
      eccNewsTimer: setInterval(async () => {
        await this.newsFeedCycle();
      }, this.state.eccNewsInterval),

      goalTimer: setInterval(async () => {
      }, this.state.goalInterval)
    });
  }

  /**
   * This function should pull the news articles down from medium and notify the user if there is a new news article.
   */
  newsFeedCycle() {
    const posts = this.props.eccPosts;
    const lastCheckedNews = this.props.notifications.lastCheckedNews;

    https.get('https://medium.com/feed/@project_ecc', res => {
      console.log('NEWS RESPONSE', res);
      if (res.statusCode !== 200) {
        console.error(new Error(`status code ${res.statusCode}`));
        return;
      }
      const today = new Date();
      const parser = new FeedMe();
      let totalNews = 0;
      const title = this.props.lang.eccNews;
      parser.on('end', () => {
        if (totalNews === 0 || !this.props.notifications.newsNotificationsEnabled) return;
        const body = totalNews === 1 ? title : `${totalNews} ${title}`;
        const callback = () => {
          hash.push('/news');
        };

        this.queueOrSendNotification(callback, body);
      });

      parser.on('item', (item) => {
        const url = item.guid.text;
        const hasVideo = item['content:encoded'].indexOf('iframe');
        let text = $(this.fixNewsText(item['content:encoded'])).text();
        const index = text.indexOf('Team');
        if (index === 13) {
          text = text.slice(index + 4);
        }
        const date = item.pubdate;
        const iTime = new Date(date);
        const time = tools.calculateTimeSince(this.props.lang, today, iTime);

        // push post (fetch existing posts)
        const post = {
          title: item.title,
          timeSince: time,
          hasVideo: hasVideo !== -1,
          url,
          body: text,
          date: iTime.getTime()
        };
        if (posts.length === 0 || posts[posts.length - 1].date > iTime.getTime()) {
          posts.push(post);
        }
        // put post in the first position of the array (new post)
        else if (posts[0].date < iTime.getTime()) {
          posts.unshift(post);
        }
        this.props.setEccPosts(posts);
        if (post && post.date > lastCheckedNews && this.props.notifications.newsNotificationsEnabled) {
          totalNews++;
          this.props.setNewsNotification(post.date);
        }
      });
      res.pipe(parser);
    });
  }

  fixNewsText(text) {
    let result = text.replace(new RegExp('</p><p>', 'g'), ' ');
    result = result.replace(new RegExp('</blockquote><p>', 'g'), '. ');
    return result;
  }

  queueOrSendNotification(callback, body) {
    // TODO
    if (this.props.loading || this.props.loader) {
      // this.queuedNotifications.push({ callback, body });
    } else {
      // Tools.sendOSNotification(body, callback);
    }
  }


  render() {
    return null;
  }
}

const mapStateToProps = state => {
  return {
    loading: state.startup.loading,
    loader: state.startup.loader,
    lang: state.startup.lang,
    wallet: state.application.wallet,
    eccPosts: state.application.eccPosts,
    notifications: state.notifications
  };
};

export default connect(mapStateToProps, actions)(News);
