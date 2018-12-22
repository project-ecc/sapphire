import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TweenMax } from 'gsap';
import * as actions from '../../actions';
import NewsItem from './NewsItem';
import { ipcRenderer } from 'electron';
import $ from 'jquery';
import ReactTooltip from 'react-tooltip';

import Header from './../Others/Header';
import Body from './../Others/Body';
import RightSidebar from './../Others/RightSidebar';

const Tools = require('../../utils/tools');

class News extends Component {
  constructor(props) {
    super(props);
    this.onItemClick = this.onItemClick.bind(this);
    this.refreshCoinData = this.refreshCoinData.bind(this);
    this.state = {
      isRefreshing: false
    };

    ipcRenderer.on('refresh-complete', (event, arg) => {
      console.log('in here');
      this.setState({
        isLoading: false
      });
    });
  }

  componentDidMount() {
    this.props.setNewsChecked(new Date().getTime());
  }

  handleDropDownClicked() {
    $('.dropdownFilterSelector').attr('tabindex', 1).focus();
    $('.dropdownFilterSelector').toggleClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideToggle(300);
  }

  handleDrowDownUnfocus() {
    $('.dropdownFilterSelector').removeClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideUp(300);
  }

  getSpliceValue(str) {
    const dots = '...';
    if (str.length > 150) {
      str = str.substring(0, 250) + dots;
    }
    return str;
  }

  async onItemClick(ev) {
    this.setState({
      isLoading: true
    });
    const currency = ev.currentTarget.dataset.id;
    console.log(currency);
    ipcRenderer.send('selected-currency', currency);
  }

  async refreshCoinData() {
    this.setState({
      isLoading: true
    });
    ipcRenderer.send('selected-currency', this.props.selectedCurrency);
  }

  getValue(val) {
    switch (val) {
      default:
      case 'usd' : return this.props.lang.usd;
      case 'eur' : return this.props.lang.eur;
      case 'aud' : return this.props.lang.aud;
      case 'btc': return this.props.lang.btc;
      case 'eth' : return this.props.lang.eth;
      case 'ltc':return this.props.lang.ltc;
      case 'bch': return this.props.lang.bch;
      case 'gbp': return this.props.lang.gbp;
    }
  }

  render() {
    const selectedCurrency = this.props.selectedCurrency.toUpperCase();
    const iTime = new Date(this.props.lastUpdated * 1000);
    const lastUpdated = Tools.calculateTimeSince(this.props.lang, new Date(), iTime);
    const spinClass = this.state.isLoading ? 'fa-spin' : '';
    console.log(this.props.eccPosts);
    return (
      <div className="d-flex w-100">
        <div className="padding-titlebar wrapper flex-auto">
          <Header className="no-margin-bottom">
            {this.props.lang.eccNews}
          </Header>
          <Body className="no-padding scrollable">
            {this.props.eccPosts.map((post, index) => {
              return (
                <NewsItem
                  title={post.title}
                  body={this.getSpliceValue(post.body)}
                  time={post.timeSince}
                  date={post.date}
                  key={`newsPost_${post.url}`}
                  hasVideo={post.hasVideo}
                  url={post.url}
                />
              );
            })}
          </Body>
        </div>
        <RightSidebar>
          <div className="p-4">
            <div className="dropdownFilterSelector" style={{/* width: "100px", marginLeft: "100px", top: "6px", */ height: '35px', padding: '0 0 20px 0', textAlign: 'center' }} onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
              <div className="selectFilterSelector" style={{ border: 'none', position: 'relative', top: '-1px', height: '30px' }}>
                <p className="normalWeight">{this.getValue(this.props.selectedCurrency)}</p>
                <i className="fa fa-chevron-down" />
              </div>
              <input type="hidden" name="gender" />
              <ul className="dropdown-menuFilterSelector normalWeight " style={{ margin: '0 0' }}>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="usd">{ this.props.lang.usd }</li>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="gbp">{ this.props.lang.gbp }</li>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="eur">{ this.props.lang.eur }</li>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="aud">{ this.props.lang.aud }</li>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="btc">{ this.props.lang.btc }</li>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="eth">{ this.props.lang.eth }</li>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="ltc">{ this.props.lang.ltc }</li>
                <li style={{ padding: '5px' }} onClick={this.onItemClick} data-id="bch">{ this.props.lang.bch }</li>
              </ul>
            </div>

            <button data-tip={`Last Updated ${lastUpdated}`} style={{ cursor: 'pointer', borderStyle: 'none', background: 'none' }} onClick={this.refreshCoinData}><span className="icon" style={{ marginTop: '5px' }}><i style={{ color: '#b9b9b9' }} className={`fa fa-refresh ${spinClass}`} /></span></button>

            <div className="subheading">
              { this.props.lang.marketStats }
            </div>
            <div className="statsItem">
              <p>{ this.props.lang.rank }</p>
              <p>{this.props.cmcStats.rank}</p>
            </div>
            <div className="statsItem">
              <p>{ this.props.lang.marketCap }</p>
              <p>{`${this.props.cmcStats.marketCap} ${selectedCurrency}`}</p>
            </div>
            <div className="statsItem">
              <p>{ this.props.lang.price }</p>
              <p>{`${this.props.cmcStats.price} ${selectedCurrency}` }</p>
            </div>
            <div className="statsItem">
              <p>{ this.props.lang.volume }</p>
              <p>{ `${this.props.cmcStats.volume} ${selectedCurrency}` }</p>
            </div>
          </div>
        </RightSidebar>
        <ReactTooltip />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    eccPosts: state.application.eccPosts,
    cmcStats: state.application.coinMarketCapStats,
    switchingPage: state.application.eccNewsSwitchingPage,
    selectedCurrency: state.application.selectedCurrency,
    lastUpdated: state.application.coinMarketLastUpdated
  };
};

export default connect(mapStateToProps, actions)(News);
