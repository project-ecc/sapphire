import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getAllTransactions, searchAllTransactions} from "../../Managers/SQLManager";

import { traduction } from '../../lang/lang';
import * as actions from '../../actions';
const moment = require('moment');

moment.locale('en');

import $ from 'jquery';

const homedir = require('os').homedir();
const lang = traduction();
const Tools = require('../../utils/tools');

class Transaction extends Component {
  constructor(props) {
    super(props);
    this.rowClicked = this.rowClicked.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.handleNextClicked = this.handleNextClicked.bind(this);
    this.handlePreviousClicked = this.handlePreviousClicked.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      searchValue: '',
      transactionData: props.data
    };
  }

  async componentDidMount() {

    this.props.setTransactionsData(this.props.data, "all");
    this.props.setTransactionsPage(0);
    this.updateTable();

    $( window ).on('resize', () => {
      this.updateTable();
    });
    $(".extraInfoTransaction").hide();
    this.props.setEarningsChecked(new Date().getTime());
  }

  componentWillUnmount() {
    $( window ).off('resize');
  }

  componentDidUpdate(lastProps, nextProps){
    // console.log(lastProps);
    // console.log(nextProps);
  }

  handleChange(e) {
    if(e.target.value === ''){
      this.setState({
        transactionData: this.props.data
      })
      return;
    }

    const result =  this.props.data.filter(transaction => {
      for (const key in transaction) {
        if (String(transaction[key]).toLowerCase().indexOf(String(e.target.value).toLowerCase()) >= 0) return transaction;
      }
    });

    this.setState({
      transactionData: result
    })
  }
  async handleNextClicked(){
    if(this.props.requesting || this.props.data.length < 100) return;
    await this.getAllTransactions(this.props.page + 1);
    $("#rows").animate({ scrollTop: 0 }, "fast");
  }

  async handlePreviousClicked() {
    if (this.props.requesting || this.props.page === 0) return;
    await this.getAllTransactions(this.props.page - 1);
    $("#rows").animate({ scrollTop: 0 }, "fast");
  }

  async getAllTransactions(page) {
    const where = {
      is_main: 1
    };

    let transactionOffset = page === 0 ? 0 : 100

    const transactions = await getAllTransactions(100, transactionOffset * page, where);
    this.props.setTransactionsData(transactions, this.props.type);
    this.props.setTransactionsPage(page);
    this.setState({
      transactionData: this.props.data
    });
    this.updateTable();
  }

  renderStatus(opt) {
    if (opt < 30) {
      return (
        <span className="desc_p">{ this.props.lang.pending }</span>
      );
    } else if (opt >= 30) {
      return (
        <span className="desc_c ecc">{ this.props.lang.confirmed }</span>
      );
    } else if (opt < 0) {
      return (
        <span className="desc_o">{ this.props.lang.orphaned }</span>
      );
    }
  }

 updateTable(){
    $('#rows').css("height", $('#transactionAddresses').height()-204);
    let numberOfChildren = this.props.data.length;
    let totalSize = numberOfChildren * 40; //40px height of each row
    let sizeOfContainer = $('#transactionAddresses').height()-204;
    if(sizeOfContainer < totalSize){
      $('.headerAddresses').css("left", "-6px");
    }
    else{
      $('.headerAddresses').css("left", "-2px");
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

  rowClickedFixMisSlideUp(event){
    event.stopPropagation();
  }

  shouldComponentUpdate(state){
    if(this.props.page === state.page && this.props.page > 0 && this.props.type === state.type) return false;
    return true;
  }
  componentWillReceiveProps(){
    this.updateTable();
  }

  handleDropDownClicked(){
    $('.dropdownFilterSelector').attr('tabindex', 1).focus();
    $('.dropdownFilterSelector').toggleClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideToggle(300);
  }

  handleDrowDownUnfocus(){
    $('.dropdownFilterSelector').removeClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideUp(300);
  }

  async onItemClick(event) {
    const type = event.currentTarget.dataset.id;
    // console.log('type')
    // console.log(this.props.type)
    if(type === this.props.type) return;
    const where = {
      is_main: 1
    };
    if(type !== 'all'){
      where.category = type;
    }
    // console.log(where)
    const transactions = await getAllTransactions(100, 0, where);
    this.props.setTransactionsData(transactions, type);
    this.props.setTransactionsPage(0);
    $(".extraInfoTransaction").hide();
    $(".extraInfoTransaction").each(function() {
      $(this).attr('sd', 'false');
    });
  }

  getValue(val){
    switch(val){
      case "1" : return this.props.lang.confirmed;
      case "-1" : return this.props.lang.orphaned;
      case "0" : return this.props.lang.pending;
      case "all": return this.props.lang.all;
      case "send" : return this.props.lang.sent;
      case "generate":
        //this.props.setEarningsChecked(new Date().getTime());
        return this.props.lang.earned;
      case "receive": return this.props.lang.received;
    }
  }

  render() {
    // const data = this.orderTransactions(this.props.data);
    const data = this.state.transactionData
    const today = new Date();
    let counter = -1;
    const rowClassName = "row normalWeight tableRowCustom tableRowCustomTransactions";

    return (
      <div style={{height: "100%", width: "100%", paddingLeft: "20px", paddingRight: "10px", overflowX: "hidden"}}>
        <div id="transactionAddresses" style={{height:"90%", position: "relative", top: "25px"}}>
          <div className="tableHeaderNormal">

            <div className="row">
              <div className="col-sm-6">
                <p className="tableHeaderTitle tableHeaderTitleSmall">{ this.props.lang.transactions }  </p>
              </div>
              <div className="col-sm-6">
                <div className="row">
                  <div className="col-sm-6">
                    <div className="box">
                      <div className="container-1">
                        <span className="icon"><i className="fa fa-search"></i></span>
                        <input onChange={(e) => {this.handleChange(e)}} type="search" id="search" placeholder="Search..." />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    {
                      <div className="dropdownFilterSelector" style={{width: "100px", marginLeft: "100px", top: "6px", height:"35px", padding:"0 0", textAlign:"center"}} onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
                        <div className="selectFilterSelector" style={{border: "none", position:"relative", top: "-1px", height: "30px"}}>
                          <p className="normalWeight">{this.getValue(this.props.type)}</p>
                          <i className="fa fa-chevron-down"></i>
                        </div>
                        <input type="hidden" name="gender"></input>
                        <ul className="dropdown-menuFilterSelector normalWeight" style={{margin: "0 0"}}>
                          <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="all">{ this.props.lang.all }</li>
                          <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="receive">{ this.props.lang.received }</li>
                          <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="send">{ this.props.lang.sent }</li>
                          <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="generate">{ this.props.lang.earned }</li>
                          <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="1">{ this.props.lang.confirmed }</li>
                          <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="0">{ this.props.lang.pending }</li>
                          <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="-1">{ this.props.lang.orphaned }</li>
                        </ul>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div style={{width: "100%", marginTop: "15px", padding: "0 0"}}>
            <div className="row rowDynamic">
              <div className="col-sm-3 headerAddresses tableRowHeader text-left" style={{paddingLeft: "4%"}}>{ this.props.lang.date }</div>
              <div id="addressHeader" className="col-sm-4 headerAddresses tableRowHeader text-left">{ this.props.lang.info }</div>
              <div id="addressHeader" className="col-sm-5 headerAddresses tableRowHeader" style={{textAlign: "right"}}>{ this.props.lang.amount } & {this.props.lang.status}</div>
            </div>
          <div id="rows" style={{height: "500px", width: "100%", padding: "0 0", overflowY: "scroll"}}>
            {data.map((t, index) => {
             // console.log(t, index)
             //  console.log(t)


              if (this.props.type === 'all'
              || this.props.type === t.category
              || this.props.type === t.confirmations
              || (this.props.type === 1 && t.confirmations > 0)
              || (this.props.type === -1 && t.confirmations < 0)){
                if(this.props.type === "generate" && t.amount === 0) return null;
                counter++;
                const iTime = new Date(t.time);
                let time = Tools.calculateTimeSince(this.props.lang, today, iTime);

                let category_label;
                let category = t.category;
                if (category === 'generate') {
                  category = <span className="icon"  style={{float: "left", paddingRight:"14px", fontSize:"24px", color:"#8e8e8e"}}><i className="fa fa-trophy"></i></span>
                  category_label = lang.stakedMin;
                }
                if (category === 'staked') {
                  category = <span className="icon" style={{float: "left", paddingRight:"14px", fontSize:"24px", color:"#8e8e8e"}}><i className="fa fa-shopping-basket"></i> </span>
                  category_label = lang.staked;
                }
                else if (category === 'send') {
                  category = <span className="icon" style={{float: "left", paddingRight:"14px", fontSize:"24px", color:"#8e8e8e"}}><i className="fa fa-upload"></i> </span>
                  category_label = lang.sent;
                }
                else if (category === 'receive') {
                  category = <span className="icon" style={{float: "left", paddingRight:"14px", fontSize:"24px", color:"#8e8e8e"}}><i className="fa fa-download"></i></span>
                  category_label = lang.received;
                }
                else if (category === 'immature') {
                  category = lang.immature;
                }

                return (
                  <div className= {counter % 2 !== 0 ? rowClassName : rowClassName + " tableRowEven"} style={{padding:"10px 0",cursor: "pointer", fontSize: "15px", minHeight: "40px", justifyContent:"space-around"}} key={`transaction_${index}_${t.txid}`} onClick={this.rowClicked.bind(this, index)}>
                    <div className="col-sm-2" style={{paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}><span>{moment(t.time).format('MMMM Do')}</span></p>
                    </div>
                    <div className="col-sm-5 text-center" style={{paddingTop: "9px"}}>
                       {category}
                      <div className="transactionAddress text-left" >
                       <p style={{ margin: '0px', display:"inline",color:"#d2d2d2"}}><span className="desc2 transactionAddress"> {t["address.ansrecords.name"] != null ? t['address.ansrecords.name'] : t['address.address']}</span></p><p style={{fontSize: "12px", color:"#8e8e8e" }}> {category_label} {time}</p>
                      </div>
                    </div>
                    <div className="col-sm-3 text-right" style={{paddingTop: "9px", textAlign: "right"}}>
                      <p style={{ margin: '0px' }}>{t.amount} ECC</p>
                      <p style={{ margin: '0px', fontSize: "12px" }}>{this.renderStatus(t.confirmations)}</p>
                    </div>
                    <div id={`trans_bottom_${index}`} onClick={this.rowClickedFixMisSlideUp} className="row extraInfoTransaction" style={{ paddingLeft: "4%", width: "100%", paddingTop: "11px", paddingBottom: "11px", cursor:"default", zIndex:"2", display:"none"}}>
                      <div className="col-sm-8">
                        <p className="transactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.dateString}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{(new Date(t.time).toDateString()).toString()}</span></p>
                      </div>
                      <div className="col-sm-4">
                        <p className="transactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.confirmations}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{t.confirmations}</span></p>
                      </div>
                      <div className="col-sm-8">
                        <p className="transactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.transactionId}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3 transactionId selectableText">{t.transaction_id}</span></p>
                      </div>
                      <div className="col-sm-4">
                        <p className="transactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.transactionFee}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{t.fee}</span></p>
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
              <p className="buttonTransaction" onClick={this.handlePreviousClicked} style={{marginRight: "50px", opacity: this.props.page === 0 ? "0.2" : "1", cursor: this.props.page === 0 ? "default" : "pointer"}}>{ this.props.lang.previous }</p>
            </div>
            <div className="col-sm-6 text-left">
              <p className="buttonTransaction" onClick={this.handleNextClicked} style={{marginLeft: "50px", opacity: this.props.data.length < 100 ? "0.2" : "1", cursor: this.props.data.length < 100 ? "default" : "pointer"}}>{ this.props.lang.next }</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderOtherTransactions() {

  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    page: state.application.transactionsPage,
    data: state.chains.transactionsData,
    type: state.chains.transactionsType,
    requesting: state.application.transactionsRequesting,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Transaction);
