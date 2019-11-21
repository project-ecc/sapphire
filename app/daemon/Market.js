import React, {Component} from 'react';
import * as tools from '../utils/tools';
import {connect} from 'react-redux';
import {ipcRenderer} from 'electron';
import * as actions from '../actions';


const settings = require('electron-settings');
const request = require('request');
const moment = require('moment');

const event = require('../utils/eventhandler');


class News extends Component {
  constructor(props) {
    super(props);

    this.getCoinMarketCapStats = this.getCoinMarketCapStats.bind(this);
    this.startCycle = this.startCycle.bind(this);
    this.queueOrSendNotification = this.queueOrSendNotification.bind(this);

    this.state = {
      // Check for news every 2 hours (user can refresh manually too)
      eccMarketInterval: 7200000,
      eccMarketTimer: null
    };

    this.listenToEvents();
  }

  componentWillUnmount() {
    clearInterval(this.state.eccMarketTimer);

    event.removeListener('startConnectorChildren');
  }

  listenToEvents() {
    event.on('startConnectorChildren', this.startCycle);

    ipcRenderer.on('selected-currency', async (event, arg) => {
      console.log('in here ', arg);
      await this.getCoinMarketCapStats(arg);
      ipcRenderer.send('refresh-complete');
    });
  }

  async startCycle() {
    // Fetch the news first.. then start the interval for checking every x milliseconds
    await this.getCoinMarketCapStats();
    this.setState({
      eccMarketTimer: setInterval(async () => {
        await this.getCoinMarketCapStats();
      }, this.state.eccMarketInterval)
    });
  }

  /**
   * This function should pull the news articles down from medium and notify the user if there is a new news article.
   */

  getCoinMarketCapStats(currency = '') {
    return new Promise((resolve, reject) => {
      let url = '';
      if (currency === '') {
        currency = 'USD';
        url = 'https://api.coinmarketcap.com/v2/ticker/212';
      } else {
        currency = currency.toUpperCase();
        url = `https://api.coinmarketcap.com/v2/ticker/212/?convert=${currency}`;
      }

      const options = {
        url,
      };
      const self = this;
      function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
          const json = JSON.parse(body);
          // console.log(json)
          self.props.setCoinMarketCapStats({
            stats: {
              price: tools.formatNumber(Number(json.data.quotes[currency].price)),
              rank: json.data.rank,
              marketCap: tools.formatNumber(Number(json.data.quotes[currency].market_cap)),
              volume: tools.formatNumber(Number(json.data.quotes[currency].volume_24h))
            },
            lastUpdated: moment().unix()
          });

          self.props.setSelectedCurrency(currency);
          resolve(true);
        } else {
          resolve(undefined);
          console.log(error);
        }
      }
      request(options, callback);
    });
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
