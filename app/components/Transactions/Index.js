import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getAllTransactions} from '../../Managers/SQLManager';

import {traduction} from '../../lang/lang';
import * as actions from '../../actions';

import Header from './../../components/Others/Header';
import Body from './../../components/Others/Body';

import $ from 'jquery';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
const event = require('../../utils/eventhandler');

import TransactionModal from './partials/TransactionModal';
const moment = require('moment');

moment.locale('en');

const lang = traduction();
const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);
    this.rowClicked = this.rowClicked.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.handleNextClicked = this.handleNextClicked.bind(this);
    this.handlePreviousClicked = this.handlePreviousClicked.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      searchValue: '',
      transactionData: props.data,
      isRefreshing: false,
      transactionDropdownOpen: false,
      selectedTransaction: '',
      selectedDropDown: 'All'
    };

    this.availableSelections = [
      {key: 'all', value: this.props.lang.all},
      {key: 'receive', value: this.props.lang.received},
      {key: 'send', value: this.props.lang.sent},
      {key: 'generate', value: this.props.lang.earned},
      {key: 'confirmed', value: this.props.lang.confirmed},
      {key: 'pending', value: this.props.lang.pending},
      {key: 'orphaned', value: this.props.lang.orphaned}
    ];

    event.on('reloadTransactions', async() => {
      await this.getAllTransactions(0, this.props.type);
      this.setState({
        isRefreshing: false
      });
    })
  }

  async componentDidMount() {
    if(!this.props.initialDownload){
      this.props.setPopupLoading(true);
      await this.getAllTransactions(0, this.props.type);

      $(window).on('resize', () => {
        this.updateTable();
      });
      $('.extraInfoTransaction').hide();
    }

    this.props.setEarningsChecked(new Date().getTime());
  }

  componentWillUnmount() {
    $(window).off('resize');
  }

  handleChange(e) {
    if (e.target.value === '') {
      this.setState({
        transactionData: this.props.data
      });
      return;
    }

    const result = this.props.data.filter(transaction => {
      for (const key in transaction) {
        if (String(transaction[key]).toLowerCase().indexOf(String(e.target.value).toLowerCase()) >= 0) return transaction;
      }
    });

    this.setState({
      transactionData: result
    });
    this.updateTable();
  }
  async handleNextClicked() {
    if (this.props.requesting || this.props.data.length < 100) return;
    await this.getAllTransactions(this.props.page + 1, this.props.type);
    $('#rows').animate({ scrollTop: 0 }, 'fast');
  }

  async handlePreviousClicked() {
    if (this.props.requesting || this.props.page === 0) return;
    await this.getAllTransactions(this.props.page - 1, this.props.type);
    $('#rows').animate({ scrollTop: 0 }, 'fast');
  }


  async reloadTransactions() {
    this.setState({
      isRefreshing: true
    });
    event.emit('loadTransactions');
  }
  async getAllTransactions(page, type = 'all') {
    this.setState({
      isRefreshing: true
    });

    const where = {
      is_main: 1
    };

    switch (type) {
      case 'pending':
      case 'orphaned':
      case 'confirmed':
        where.status = type;
        break;
      case 'send':
      case 'receive':
      case 'generate':
        where.category = type;
        break;
    }
    const transactions = await getAllTransactions(100, 100 * page, where);
    this.props.setTransactionsData(transactions, type);
    this.props.setTransactionsPage(page);
    this.setState({
      transactionData: transactions
    });
    this.updateTable();
    $('.extraInfoTransaction').hide();
    $('.extraInfoTransaction').each(function () {
      $(this).attr('sd', 'false');
    });
    this.setState({
      isRefreshing: false
    });
  }

  renderStatus(opt, cat) {
    if (opt < 30 && cat === 'generate') {
      return (
        <span className="desc_p">{ this.props.lang.immature }</span>
      );
    } else if (opt < 10) {
      return (
        <span className="desc_p">{ this.props.lang.pending }</span>
      );
    } else if (opt >= 10) {
      return (
        <span className="desc_c ecc">{ this.props.lang.confirmed }</span>
      );
    } else if (opt < 0) {
      return (
        <span className="desc_o">{ this.props.lang.orphaned }</span>
      );
    }
  }

  updateTable() {
    const numberOfChildren = this.props.data.length;
    const totalSize = numberOfChildren * 40; // 40px height of each row
    const sizeOfContainer = $('#transactionAddresses').height() - 204;
    if (sizeOfContainer < totalSize) {
      $('.headerAddresses').css('left', '-6px');
    } else {
      $('.headerAddresses').css('left', '-2px');
    }
  }

  rowClicked(index) {
    const transactionBottom = $(`#trans_bottom_${index}`);
    if (transactionBottom.attr('sd') === 'false' || transactionBottom.attr('sd') === undefined) {
      $(transactionBottom).slideDown();
      $(transactionBottom).attr('sd', 'true');
    } else {
      transactionBottom.slideUp();
      transactionBottom.attr('sd', 'false');
    }
  }

  rowClickedFixMisSlideUp(event) {
    event.stopPropagation();
  }
  // componentWillReceiveProps() {
  //   this.updateTable();
  // }

  handleDropDownClicked() {
    $('.dropdownFilterSelector').attr('tabindex', 1).focus();
    $('.dropdownFilterSelector').toggleClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideToggle(300);
  }

  handleDrowDownUnfocus() {
    $('.dropdownFilterSelector').removeClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideUp(300);
  }

  async onItemClick(ev) {
    const type = ev.currentTarget.dataset.id;
    const name = ev.currentTarget.name;
    this.setState({
      selectedDropDown: name
    })

    await this.getAllTransactions(this.props.page, type);
  }

  async onTransactionClick(txId){
    this.setState({
      selectedTransaction: txId
    })
    this.transactionModal.getWrappedInstance().toggle();
  }

  toggle() {
    this.setState(prevState => ({
      transactionDropdownOpen: !prevState.transactionDropdownOpen
    }));
  }

  renderTransactionTable(){

    if(this.props.initialDownload) {
      return (
        <div>
          <h4>Your transactions will appear after your initial sync</h4>
        </div>
      );
    } else {
      const data = this.state.transactionData;
      const today = new Date();
      let counter = -1;
      const rowClassName = 'row normalWeight tableRowCustom tableRowCustomTransactions';
      const spinClass = this.state.isRefreshing ? 'fa-spin' : '';


      return (
        <div id='table'>
          <div className="tableHeaderNormal" style={{ display: 'flex', alignItems: 'center' }}>

            <div className="d-flex justify-content-end w-100">
              <button style={{ cursor: 'pointer', borderStyle: 'none', background: 'none' }} onClick={(e) => this.reloadTransactions()}><span className="icon" style={{ marginTop: '5px', top: '0' }}><i style={{ color: '#b9b9b9' }} className={`fa fa-refresh ${spinClass}`} /></span></button>
              <div className="col-sm-6" style={{ display: 'flex', alignItems: 'center', maxWidth: '300px' }}>
                <div className="box" style={{ width: '100%' }}>
                  <div className="container-1" style={{ width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center' }}>
                    <span className="icon" style={{ marginTop: '5px', top: '0' }}><i className="fa fa-search" /></span>
                    <input onChange={(e) => { this.handleChange(e); }} type="search" id="search" placeholder="Search..." />
                  </div>
                </div>
              </div>
              <div className="col-sm-3" style={{ textAlign: 'right', maxWidth: '150px', display: 'flex', alignItems: 'center' }}>
                <Dropdown isOpen={this.state.transactionDropdownOpen} toggle={this.toggle} className="mt-1">
                  <DropdownToggle caret>
                    <small>Sort:</small> { this.state.selectedDropDown}
                  </DropdownToggle>
                  <DropdownMenu>
                    { this.availableSelections.map(obj => (
                      <DropdownItem onClick={this.onItemClick} name={obj.value} key={obj.key} data-id={obj.key} active={this.props.type === obj.key}>{ obj.value }</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

          </div>
          <div style={{ width: '100%', /* marginTop: "15px" */alignItems: 'center', padding: '0 0' }}>
            <div className="row rowDynamic" style={{ alignItems: 'center' }}>
              <div className="col-sm-3 headerAddresses tableRowHeader text-left" style={{/* paddingLeft: "4%" */}}>{ this.props.lang.date }</div>
              <div id="addressHeader" className="col-sm-6 headerAddresses tableRowHeader text-left">{ this.props.lang.info }</div>
              <div id="addressHeader" className="col-sm-3 headerAddresses tableRowHeader" style={{ textAlign: 'right' }}>{ this.props.lang.amount } & {this.props.lang.status}</div>
            </div>
            <div id="rows">
              {data.map((t, index) => {
                // console.log(t, index)
                // console.log(t)

                if (this.props.type === 'all'
                  || this.props.type === t.category
                  || this.props.type === t.status) {
                  counter++;
                  const iTime = new Date(t.time * 1000);
                  const time = Tools.calculateTimeSince(this.props.lang, today, iTime);

                  let category_label;
                  let category = t.category;
                  if (category === 'generate') {
                    category = <span className="icon" style={{ float: 'left', paddingRight: '14px', fontSize: '24px' /* ,color:"#8e8e8e" */}}><i className="fa fa-trophy" /></span>;
                    category_label = lang.stakedMin;
                  }
                  if (category === 'staked') {
                    category = <span className="icon" style={{ float: 'left', paddingRight: '14px', fontSize: '24px' /* ,color:"#8e8e8e" */}}><i className="fa fa-shopping-basket" /> </span>;
                    category_label = lang.staked;
                  } else if (category === 'send') {
                    category = <span className="icon" style={{ float: 'left', paddingRight: '14px', fontSize: '24px' /* ,color:"#8e8e8e" */}}><i className="fa fa-upload" /> </span>;
                    category_label = lang.sent;
                  } else if (category === 'receive') {
                    category = <span className="icon" style={{ float: 'left', paddingRight: '14px', fontSize: '24px'/* , color:"#8e8e8e" */ }}><i className="fa fa-download" /></span>;
                    category_label = lang.received;
                  } else if (category === 'immature') {
                    category = lang.immature;
                  }

                  return (
                    <div key={index}>
                      <div className={counter % 2 !== 0 ? rowClassName : `${rowClassName} tableRowEven`} style={{ padding: '0', cursor: 'pointer', fontSize: '15px', justifyContent: 'space-around', minHeight: '40px' }} key={`transaction_${index}_${t.txid}`} onClick={this.rowClicked.bind(this, index)}>
                        <div className="col-sm-3" style={{}}>
                          <p style={{ margin: '0px' }}><span>{moment(t.time * 1000).format('MMMM Do YYYY')}</span></p>
                        </div>
                        <div className="col-sm-6 text-center" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                          {category}
                          <div className="transactionAddress text-left" >
                            <p style={{ margin: '0px', display: 'inline' }}><span className="desc2 transactionAddress"> {t['address.ansrecords.name'] != null ? t['address.ansrecords.name'] + t['address.ansrecords.code'] : t['address.address']}</span></p><p className="transactionInfoTitle" style={{ fontSize: '12px' }}> {category_label} {time}</p>
                          </div>
                        </div>
                        <div className="col-sm-3 text-right" style={{ textAlign: 'right' }}>
                          <p style={{ margin: '0px' }}>{t.amount} ECC</p>
                          <p style={{ margin: '0px', fontSize: '12px' }}>{this.renderStatus(t.confirmations, t.category)}</p>
                        </div>
                      </div>
                      <div id={`trans_bottom_${index}`} onClick={this.rowClickedFixMisSlideUp} className="row extraInfoTransaction" style={{ paddingLeft: '2%', width: '100%', paddingTop: '6px', paddingBottom: '6px', cursor: 'default', zIndex: '2', display: 'none', margin: '0', }}>
                        <div style={{ padding: '0 15px' }}>
                          <p className="transactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2 small-header">{lang.dateString}</span></p>
                          <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3 small-text">{(new Date(t.time * 1000).toDateString()).toString()}</span></p>
                        </div>
                        <div style={{ padding: '0 15px' }}>
                          <p className="transactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2 small-header">{lang.transactionFee}</span></p>
                          <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3 small-text">{t.fee}</span></p>
                        </div>

                        <div style={{ padding: '0 15px' }}>
                          <p className="transactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2 small-header">{lang.transactionId}</span></p>
                          <p style={{ margin: '0px 0px 5px 0px' }}><span /*onClick={(e) => this.onTransactionClick(t.transaction_id)}*/ className="desc3 small-text selectableText">{t.transaction_id}</span></p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6 text-right">
              <p className="buttonTransaction" onClick={this.handlePreviousClicked} style={{ marginRight: '50px', opacity: this.props.page === 0 ? '0.2' : '1', cursor: this.props.page === 0 ? 'default' : 'pointer' }}>{ this.props.lang.previous }</p>
            </div>
            <div className="col-sm-6 text-left">
              <p className="buttonTransaction" onClick={this.handleNextClicked} style={{ marginLeft: '50px', opacity: this.props.data.length < 100 ? '0.2' : '1', cursor: this.props.data.length < 100 ? 'default' : 'pointer' }}>{ this.props.lang.next }</p>
            </div>
          </div>
        </div>
      );
    }

  }

  render() {
    return (
      <div id="transactionAddresses" className="padding-titlebar">
        <Header>
          { this.props.lang.transactions }
        </Header>
        <Body noPadding>
        {this.renderTransactionTable()}
        </Body>
        <TransactionModal transactionId={this.state.selectedTransaction} ref={(e) => { this.transactionModal = e; }} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    page: state.application.transactionsPage,
    data: state.chains.transactionsData,
    type: state.chains.transactionsType,
    requesting: state.application.transactionsRequesting,
    wallet: state.application.wallet,
    isFilteringTransactions: state.application.filteringTransactions,
    initialDownload: state.chains.initialDownload
  };
};

export default connect(mapStateToProps, actions)(Index);
