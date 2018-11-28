import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import hash from '../../router/hash';
import * as tools from '../../utils/tools';
import { ECC_POST } from '../../actions/types';

class News extends Component {
  constructor(props) {
    super(props);

    this.newsFeedCycle = this.newsFeedCycle.bind(this);

    this.listenToEvents();

    this.state = {
      // Check for news every 2 hours (user can refresh manually too)
      eccNewsInterval: 7200000,
      eccNewsTimer: null
    };
  }

  componentWillUnmount() {
    clearInterval(this.state.eccNewsTimer);
  }

  listenToEvents() {
    ipcRenderer.on('startConnectorChildren', this.startCycle);
  }

  startCycle() {
    this.setState({
      eccNewsTimer: setInterval(async () => {
        await this.newsFeedCycle();
      }, this.state.eccNewsInterval)
    });
  }

  /**
   * This function should pull the news articles down from medium and notify the user if there is a new news article.
   */
  newsFeedCycle() {
    const posts = this.props.application.eccPosts;
    const lastCheckedNews = this.props.notifications.lastCheckedNews;
    https.get('https://medium.com/feed/@project_ecc', (res) => {
      if (res.statusCode !== 200) {
        console.error(new Error(`status code ${res.statusCode}`));
        return;
      }
      const today = new Date();
      const parser = new FeedMe();
      let totalNews = 0;
      const title = this.props.startup.lang.eccNews;
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
        const time = tools.calculateTimeSince(this.props.startup.lang, today, iTime);

        // push post (fetch existing posts)
        let post;
        if (posts.length === 0 || posts[posts.length - 1].date > iTime.getTime()) {
          post = {
            title: item.title,
            timeSince: time,
            hasVideo: hasVideo !== -1, // probably going to remove this video flag
            url,
            body: text,
            date: iTime.getTime()
          };
          posts.push(post);
          this.store.dispatch({ type: ECC_POST, payload: posts });
        }
        // put post in the first position of the array (new post)
        else if (posts[0].date < iTime.getTime()) {
          post = {
            title: item.title,
            timeSince: time,
            hasVideo: hasVideo !== -1,
            url,
            body: text,
            date: iTime.getTime()
          };
          posts.unshift(post);
          this.props.setEccPosts(posts);
        }
        if (post && post.date > lastCheckedNews && this.props.notifications.newsNotificationsEnabled) {
          totalNews++;
          this.props.setNewsNotification(post.date);
        }
      });
      res.pipe(parser);
    });
  }


  render() {
    return null;
  }
}

export default News;
