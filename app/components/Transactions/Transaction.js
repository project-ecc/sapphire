import $ from 'jquery';
import React, { Component } from 'react';
import Wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import connectWithTransitionGroup from 'connect-with-transition-group';
import { connect } from 'react-redux';
const lang = traduction();
const wallet = new Wallet();
const settings = require('electron-settings');

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
    const self = this;
    $( window ).on('resize', function() {
      self.updateTable();
    });
    $(".extraInfoTransaction").hide();
    self.updateTable();
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
    const self = this;

    wallet.getTransactions(null, 100, 100 * page).then((data) => {
        self.props.setTransactionsData(data, this.props.type)
        self.props.setTransactionsPage(page);
        self.updateTable();
        $(".extraInfoTransaction").hide();
    }).catch((err) => {
        console.log("error getting transactions: ", err)
    });
  }

  renderStatus(opt) {
    if (opt === 0) {
      return (
        <span style={{position: "relative"}} className="desc_p">{lang.pending}</span>
      );
    } else if (opt > 0) {
      return (
        <span style={{position: "relative"}} className="desc_c ecc">{lang.confirmed}</span>
      );
    } else if (opt < 0) {
      return (
        <span style={{position: "relative"}} className="desc_o">{lang.orphaned}</span>
      );
    }
  }

 updateTable(){
    $(".extraInfoTransaction").hide();
    $('#rows').css("height", $('#transactionAddresses').height()-204)
    let numberOfChildren = this.props.data.length;
    let totalSize = numberOfChildren * 40; //40px height of each row
    console.log(numberOfChildren)
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
      case "generate": return "Earned";
      case "receive": return "Received";
    }
  }

  render() {
    const data = this.orderTransactions(this.props.data);
    const self = this;
    const today = new Date();
    let counter = -1;
    return (
      <div style={{height: "100%", width: "100%", paddingLeft: "20px", paddingRight: "10px", overflowX: "hidden"}}>
        <div id="transactionAddresses" style={{height:"90%", backgroundColor: "#1c2340", position: "relative", top: "25px", boxShadow: "0 4px 11px -6px black"}}>
          <div style={{width: "100%", height:"46px", boxShadow: "0 2px 4px -3px rgba(0, 0, 0, 0.74)"}}>
            <p className="tableHeader" style={{paddingTop: "7px", paddingLeft: "5%", color: "#b4b7c8"}}>Transactions</p>
            <div className="dropdownFilterSelector" style={{position: "absolute", right: "40px", top: "9px", height:"30px", padding:"0 0", width :"210px", textAlign:"center"}} onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
              <div className="selectFilterSelector" style={{border: "none", position:"relative", top: "-1px", height: "30px"}}>
                <p className="normalWeight">{self.getValue(this.props.type)}</p>
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
          <div className="container" style={{width: "100%", marginTop: "5px", padding: "0 0"}}>
            <div className="row" style={{height: "55px"}}>
              <div className="col-sm-6" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingLeft: "4%", paddingTop: "16px", fontWeight: "600"}}>TYPE</div>
              <div id="addressHeader" className="col-sm-2 headerAddresses" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingTop: "16px", fontWeight: "600"}}>AMOUNT</div>
              <div id="addressHeader" className="col-sm-2 headerAddresses" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingTop: "16px", fontWeight: "600"}}>STATUS</div>
              <div id="addressHeader" className="col-sm-2 headerAddresses" style={{position:"relative", fontSize: "14px", color: "#555d77", paddingTop: "16px", fontWeight: "600"}}>TIME</div>
            </div>
          <div id="rows" className="container" style={{height: "500px", width: "100%", padding: "0 0"}}>
            {data.map((t, index) => {

              if (self.props.type === 'all'
              || self.props.type === t.category
              || self.props.type === t.confirmations
              || (self.props.type == 1 && t.confirmations > 0)
              || (self.props.type == -1 && t.confirmations < 0)){
                if(self.props.type == "generate" && t.amount == 0) return null;
                counter++;
                let cr = '';
                if (index % 2 === 0) {
                  cr = 'stripped';
                }
                const iTime = new Date(t.time * 1000);

                let delta = Math.abs(today.getTime() - iTime.getTime()) / 1000;
                const days = Math.floor(delta / 86400);
                delta -= days * 86400;
                const hours = Math.floor(delta / 3600) % 24;
                delta -= hours * 3600;
                const minutes = Math.floor(delta / 60) % 60;


                let time = '';
                if (settings.get('settings.lang') === 'fr') {
                  time = `${lang.translationExclusiveForFrench} `;
                }
                if (days > 0) {
                  time += `${days} `;
                  if (days === 1) {
                    time += lang.transactionsDay;
                  } else {
                    time += lang.transactionsDays;
                  }
                } else if (hours > 0) {
                  time += `${hours} `;
                  if (hours === 1) {
                    time += lang.transactionsHour;
                  } else {
                    time += lang.transactionsHours;
                  }
                } else if (minutes === 1) {
                  time += `${minutes} ${lang.transactionsMinute}`;
                } else {
                  time += `${minutes} ${lang.transactionsMinutes}`;
                }

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
                  <div className="row normalWeight" style={{cursor: "pointer", fontSize: "15px", color: "#9099b7", minHeight: "40px", backgroundColor: counter % 2 != 0 ? "transparent" : "#1b223d"}} key={`transaction_${index}_${t.txid}`} onClick={self.rowClicked.bind(self, index)}>
                    <div className="col-sm-6 transactionAddress" style={{paddingLeft: "4%", paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}><span style={{position: "relative"}}>{category}</span><span style={{position: "relative"}} className="desc2 transactionAddress"> ({t.address})</span></p>
                    </div>
                    <div className="col-sm-2" style={{paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}><span style={{position: "relative"}}>{t.amount} ecc</span></p>
                    </div>
                    <div className="col-sm-2" style={{paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}>{self.renderStatus(t.confirmations)}</p>
                    </div>
                    <div className="col-sm-2" style={{paddingTop: "9px"}}>
                      <p style={{ margin: '0px' }}><span style={{position: "relative"}}>{time}</span></p>
                    </div>
                    <div id={`trans_bottom_${index}`} onClick={this.rowClickedFixMisSlideUp} className="row extraInfoTransaction" style={{paddingLeft: "4%", width: "100%", paddingTop: "11px", paddingBottom: "11px", cursor:"default", zIndex:"2"}}>
                      <div className="col-sm-8">
                        <p style={{ margin: '5px 0px 0px 0px' }}><span style={{position: "relative", color: "#555d77", fontWeight: "600"}} className="desc2">{lang.dateString}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span style={{position: "relative"}} className="desc3">{(new Date(t.time * 1000)).toString()}</span></p>
                      </div>
                      <div className="col-sm-4">
                        <p style={{ margin: '5px 0px 0px 0px' }}><span style={{position: "relative", color: "#555d77", fontWeight: "600"}} className="desc2">{lang.confirmations}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span style={{position: "relative"}} className="desc3">{t.confirmations}</span></p>
                      </div>
                      <div className="col-sm-8">
                        <p style={{ margin: '5px 0px 0px 0px' }}><span style={{position: "relative", color: "#555d77", fontWeight: "600"}} className="desc2">{lang.transactionId}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span style={{position: "relative"}} className="desc3 transactionId">{t.txid}</span></p>
                      </div>
                      <div className="col-sm-4">
                        <p style={{ margin: '5px 0px 0px 0px' }}><span style={{position: "relative", color: "#555d77", fontWeight: "600"}} className="desc2">{lang.transactionFee}</span></p>
                        <p style={{ margin: '0px 0px 5px 0px' }}><span style={{position: "relative"}} className="desc3">...</span></p>
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
              <p className="buttonTransaction" onClick={this.handlePreviousClicked} style={{marginRight: "50px", opacity: self.props.page == 0 ? "0.2" : "1", cursor: self.props.page == 0 ? "default" : "pointer"}}>Previous</p>
            </div>
            <div className="col-sm-6 text-left">
              <p className="buttonTransaction" onClick={this.handleNextClicked} style={{marginLeft: "50px", opacity: self.props.data.length < 100 ? "0.2" : "1", cursor: self.props.data.length < 100 ? "default" : "pointer"}}>Next</p>
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
    requesting: state.application.transactionsRequesting  
  };
};

export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(Transaction));
