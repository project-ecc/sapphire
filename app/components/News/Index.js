import React, {Component} from 'react';
import * as actions from '../../actions';
import {connect} from 'react-redux';
import {ipcRenderer} from 'electron';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import {RefreshIcon} from 'mdi-react';

import NewsItem from './partials/NewsItem';
import Header from './../Others/Header';
import Body from './../Others/Body';
import RightSidebar from './../Others/RightSidebar';

const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);
    this.onItemClick = this.onItemClick.bind(this);
    this.refreshCoinData = this.refreshCoinData.bind(this);
    this.toggle = this.toggle.bind(this);

    this.state = {
      currencyDropdownOpen: false,
      isLoading: false
    };

    this.availableCurrencies = [
      {key: 'usd', value: this.props.lang.usd},
      {key: 'gbp', value: this.props.lang.gbp},
      {key: 'eur', value: this.props.lang.eur},
      {key: 'aud', value: this.props.lang.aud},
      {key: 'btc', value: this.props.lang.btc},
      {key: 'eth', value: this.props.lang.eth},
      {key: 'ltc', value: this.props.lang.ltc},
      {key: 'bch', value: this.props.lang.bch}
    ];

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

  toggle() {
    this.setState(prevState => ({
      currencyDropdownOpen: !prevState.currencyDropdownOpen
    }));
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

  render() {
    const selectedCurrency = this.props.selectedCurrency.toUpperCase();
    const iTime = new Date(this.props.lastUpdated * 1000);
    const lastUpdated = Tools.calculateTimeSince(this.props.lang, new Date(), iTime);
    const spinClass = this.state.isLoading ? 'fa-spin' : '';

    return (
      <div className="d-flex w-100 h-100">
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
        <RightSidebar className="position-relative">
          <div className="p-4">
            <div className="d-flex justify-content-between">
              <Dropdown isOpen={this.state.currencyDropdownOpen} toggle={this.toggle} className="mt-1">
                <DropdownToggle caret>
                  <small>Currency:</small> { this.props.selectedCurrency }
                </DropdownToggle>
                <DropdownMenu>
                  { this.availableCurrencies.map(obj => (
                    <DropdownItem onClick={this.onItemClick} key={obj.key} data-id={obj.key} active={this.props.selectedCurrency === obj.value}>{ obj.value }</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Button color="link" onClick={this.refreshCoinData}>
                <RefreshIcon />
              </Button>
            </div>

            <div className="subheading mt-3 mb-2">
              { this.props.lang.marketStats }
            </div>
            <div className="statsItem">
              <p className="small-header">{ this.props.lang.rank }</p>
              <p>{this.props.cmcStats.rank}</p>
            </div>
            <div className="statsItem">
              <p className="small-header">{ this.props.lang.marketCap }</p>
              <p>{`${this.props.cmcStats.marketCap} ${selectedCurrency}`}</p>
            </div>
            <div className="statsItem">
              <p className="small-header">{ this.props.lang.price }</p>
              <p>{`${this.props.cmcStats.price} ${selectedCurrency}` }</p>
            </div>
            <div className="statsItem">
              <p className="small-header">{ this.props.lang.volume }</p>
              <p>{ `${this.props.cmcStats.volume} ${selectedCurrency}` }</p>
            </div>
            <div className="position-absolute" style={{bottom: 10, right: 10}}>
              <small>Last Updated: { lastUpdated }</small>
            </div>
          </div>
        </RightSidebar>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    eccPosts: state.application.eccPosts,
    cmcStats: state.application.coinMarketCapStats,
    selectedCurrency: state.application.selectedCurrency,
    lastUpdated: state.application.coinMarketLastUpdated
  };
};

export default connect(mapStateToProps, actions)(Index);
