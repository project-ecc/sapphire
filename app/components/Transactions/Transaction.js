import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const lang = traduction();
const settings = require('electron-settings');
const Tools = require('../../utils/tools')

class Transaction extends Component {
  constructor(props) {
    super(props);
    this.rowClicked = this.rowClicked.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.handleNextClicked = this.handleNextClicked.bind(this);
    this.handlePreviousClicked = this.handlePreviousClicked.bind(this);
  }

  componentDidMount() {
    $( window ).on('resize', () => {
      this.updateTable();
    });
    $(".extraInfoTransaction").hide();
    this.updateTable();
  }

  componentWillUnmount() {
    $( window ).off('resize');
  }

  handleNextClicked(){
    if(this.props.requesting || this.props.data.length < 100) return;
    this.getAllTransactions(this.props.page + 1);
  }

  handlePreviousClicked(){
    if(this.props.requesting || this.props.page == 0) return;
    this.getAllTransactions(this.props.page - 1);
  }

  getAllTransactions(page) {
    this.props.wallet.getTransactions(null, 100, 100 * page).then((data) => {
        this.props.setTransactionsData(data, this.props.type)
        this.props.setTransactionsPage(page);
        this.updateTable();
        $(".extraInfoTransaction").hide();
    }).catch((err) => {
        console.log("error getting transactions: ", err)
    });
  }

  renderStatus(opt) {
    if (opt === 0) {
      return (
        <span className="desc_p">{lang.pending}</span>
      );
    } else if (opt > 0) {
      return (
        <span className="desc_c ecc">{lang.confirmed}</span>
      );
    } else if (opt < 0) {
      return (
        <span className="desc_o">{lang.orphaned}</span>
      );
    }
  }

 updateTable(){
    $(".extraInfoTransaction").hide();
    $('#rows').css("height", $('#transactionAddresses').height()-204)
    let numberOfChildren = this.props.data.length;
    let totalSize = numberOfChildren * 40; //40px height of each row
    let sizeOfContainer = $('#transactionAddresses').height()-204;
    if(sizeOfContainer < totalSize){
      $('#rows').css("overflow-y", "auto");
      $('.headerAddresses').css("left", "-6px");
    }
    else{
      $(rows).css("overflow-y", "hidden");
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

  orderTransactions(data) {
    const aux = [];
    for (let i = data.length - 1; i >= 0; i -= 1) {
      aux.push(data[i]);
    }
    return aux;
  }

  shouldComponentUpdate(state){
    console.log(state)
    if(this.props.page == state.page && this.props.page > 0) return false;
    return true;
  }
  componentWillReceiveProps(){     
    this.updateTable();
    $(".extraInfoTransaction").hide();
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

  componentDidUpdate(){
    $(".extraInfoTransaction").hide();
  }

  onItemClick(event) {
    let type = event.currentTarget.dataset.id;
    console.log(type)
    if(type == this.props.type) return;
    let data = this.props.data;
    this.props.setTransactionsData(data, type);
  }

  getValue(val){
    switch(val){
      case "1" : return "Confirmed";
      case "-1" : return "Orphaned";
      case "0" : return "Pending";
      case "all": return "All";
      case "send" : return "Sent";
      case "generate": 
        this.props.setEarningsChecked(new Date().getTime())
        return "Earned";
      case "receive": return "Received";
    }
  }

  render() {
    const data = this.orderTransactions(this.props.data);
    const today = new Date();
    let counter = -1;
    const rowClassName = "row normalWeight tableRowCustom tableRowCustomTransactions";
    
    return (
      <div style={{height: "100%", width: "100%", paddingLeft: "20px", paddingRight: "10px", overflowX: "hidden"}}>
        <div id="transactionAddresses" style={{height:"90%", position: "relative", top: "25px"}}>
          <div className="tableHeaderNormal">
            <p className="tableHeaderTitle tableHeaderTitleSmall">Transactions</p>
            <div className="dropdownFilterSelector" style={{position: "absolute", right: "40px", top: "9px", height:"30px", padding:"0 0", width :"210px", textAlign:"center"}} onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
              <div className="selectFilterSelector" style={{border: "none", position:"relative", top: "-1px", height: "30px"}}>
                <p className="normalWeight">{this.getValue(this.props.type)}</p>
                <i className="fa fa-chevron-down"></i>
              </div>
              <input type="hidden" name="gender"></input>
              <ul className="dropdown-menuFilterSelector normalWeight" style={{margin: "0 0"}}>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="all">All</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="receive">Received</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="send">Sent</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="generate">Earned</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="1">Confirmed</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="0">Pending</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="-1">Orphaned</li>
              </ul>
            </div>
          </div>
          <div style={{width: "100%", marginTop: "5px", padding: "0 0"}}>
            <div className="row rowDynamic">
              <div className="col-sm-6 headerAddresses tableRowHeader" style={{paddingLeft: "4%"}}>TYPE</div>
              <div id="addressHeader" className="col-sm-2 headerAddresses tableRowHeader">AMOUNT</div>
              <div id="addressHeader" className="col-sm-2 headerAddresses tableRowHeader">STATUS</div>
              <div id="addressHeader" className="col-sm-2 headerAddresses tableRowHeader">TIME</div>
            </div>
          <div id="rows" style={{height: "500px", width: "100%", padding: "0 0"}}>
            {data.map((t, index) => {

              if (this.props.type === 'all'
              || this.props.type === t.category
              || this.props.type === t.confirmations
              || (this.props.type == 1 && t.confirmations > 0)
              || (this.props.type == -1 && t.confirmations < 0)){
                if(this.props.type == "generate" && t.amount == 0) return null;
                counter++;
                const iTime = new Date(t.time * 1000);
                let time = Tools.calculateTimeSince(lang, today, iTime);

                let category = t.category;
                if (category === 'generate') {
                  category = lang.stakedMin;
                }
                if (category === 'staked') {
                  category = lang.staked;
                }
                else if (category === 'send') {
                  category = lang.sent;
                }
                else if (category === 'receive') {
                  category = lang.received;
                }
                else if (category === 'immature') {
                  category = lang.immature;
                }

                return (
                  <div className= {counter % 2 != 0 ? rowClassName : rowClassName + " tableRowEven"} style={{cursor: "pointer", fontSize: "15px", minHeight: "40px"}} key={`transaction_${index}_${t.txid}`} onClick={this.rowClicked.bind(this, index)}>
                    <div className="col-sm-6 transactionAddress" style={{paddingLeft: "4%", paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}><span>{category}</span><span className="desc2 transactionAddress"> ({t.address})</span></p>
                    </div>
                    <div className="col-sm-2" style={{paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}><span>{t.amount} ecc</span></p>
                    </div>
                    <div className="col-sm-2" style={{paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}>{this.renderStatus(t.confirmations)}</p>
                    </div>
                    <div className="col-sm-2" style={{paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}><span>{time}</span></p>
                    </div>
                    <div id={`trans_bottom_${index}`} onClick={this.rowClickedFixMisSlideUp} className="row extraInfoTransaction" style={{paddingLeft: "4%", width: "100%", paddingTop: "11px", paddingBottom: "11px", cursor:"default", zIndex:"2"}}>
                      <div className="col-sm-8">
                        <p className="trasactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.dateString}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{(new Date(t.time * 1000)).toString()}</span></p>
                      </div>
                      <div className="col-sm-4">
                        <p className="trasactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.confirmations}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{t.confirmations}</span></p>
                      </div>
                      <div className="col-sm-8">
                        <p className="trasactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.transactionId}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3 transactionId">{t.txid}</span></p>
                      </div>
                      <div className="col-sm-4">
                        <p className="trasactionInfoTitle" style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.transactionFee}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">...</span></p>
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
              <p className="buttonTransaction" onClick={this.handlePreviousClicked} style={{marginRight: "50px", opacity: this.props.page == 0 ? "0.2" : "1", cursor: this.props.page == 0 ? "default" : "pointer"}}>Previous</p>
            </div>
            <div className="col-sm-6 text-left">
              <p className="buttonTransaction" onClick={this.handleNextClicked} style={{marginLeft: "50px", opacity: this.props.data.length < 100 ? "0.2" : "1", cursor: this.props.data.length < 100 ? "default" : "pointer"}}>Next</p>
            </div>        
          </div>
        </div>
      </div>
    );
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
