import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';
const Tools = require('../../utils/tools')

class NetworkStats extends Component {
  constructor(props) {
    super(props);
    this.getText = this.getText.bind(this);
    this.getHtmlChainInfo = this.getHtmlChainInfo.bind(this);
  }

  getPercentage(percentage){
    if(percentage == 100) return 1130;
    else if(percentage == 0) return 0;
    console.log((percentage * 1130) / 100)
    return Math.round((percentage * 1130) / 100);
  }

  getOffset(percentage){
    let len = percentage.toString().length;
    if(len == 6) return 70;
    else if(len == 5) return 55;
    else if(len == 4) return 40;
    else if(len == 3) return 30;
    else if(len == 2) return 10;
    else if(len == 1) return 0;
  }

  getText(enabled, percentage, operation = ""){
    if(enabled){
      return(
        <svg>
          <text className="percentageSyncedNetworkVal" fill="#b4b7c8" x="50%" y="50%" dy="-35" dx="-40" textAnchor="middle">{percentage}</text>
          <text className="percentageSyncedNetwork" fill="#b4b7c8" x="50%" y="50%" dy="-35" dx={this.getOffset(percentage)} textAnchor="middle">%</text>
          <text className="syncedTextNetwork" x="50%" y="50%" dy="25" dx="-25" textAnchor="middle">{ this.props.lang.synced }</text>
        </svg>
      )
    }
    else return(
      <text style={{cursor: "pointer"}} onClick={this.processChainClick.bind(this, operation)} className="enableNetwork" fill="#b4b7c8" x="50%" y="50%" dy="-15" dx="-20" textAnchor="middle">{ this.props.lang.comingSoon }</text>
    )
  }

  getHtmlChainInfo(enabled, percentage, connections, headers, block, rgbColor, imageConnections, id, operation = ""){
    return(
      <div className="chainInfo" style={{position: "relative", paddingTop: "30px"}}>
        <svg style={{maxWidth:"216px", maxHeight: "230px"}} className="score" width="100%" height="400" viewBox="-25 -25 400 400">
        <circle className="score-empty" cx="175" cy="175" r="180" strokeWidth="6px" fill="none"></circle>
        <circle id={id} className="js-circle score-circle" transform="rotate(-90 175 175)" cx="175" cy="175" r="180" strokeDasharray="1130" strokeWidth="6px" strokeDashoffset={this.getPercentage(100-percentage)} fill="none"></circle>
        {this.getText(enabled, percentage, operation)}

        </svg>
        <div>
          <img style={{height: "21px"}} src={imageConnections}></img>
          <span style={{position: "relative", left:"9px", fontSize:"20px", top:"3px", fontWeight: "400"}}>{connections}</span>
        </div>
        <p style={{fontSize:"14px", marginTop:"15px"}}>{ this.props.lang.headers }: <span style={{fontSize:"16px"}}>{headers}</span></p>
        <p style={{fontSize:"14px", marginTop:"15px"}}>{ this.props.lang.block } <span style={{fontSize:"16px"}}>{block}</span> { this.props.lang.of } <span style={{fontSize:"16px"}}>{headers}</span></p>
      </div>
    )
  }

  processChainClick(operation){
    if(operation == "messaging"){


    }else if(operation == "fileStorage"){

    }
  }

  render() {
    let messaging = require('../../../resources/images/messaging-green.png');
    let fileStorage = require('../../../resources/images/file-storage-blue.png');
    let connectionsOrange = require('../../../resources/images/connections-orange.png');

    return (
      <div style={{height: "100%", width: "100%", paddingLeft: "40px", paddingRight: "40px"}}>
        <div id="headerNetwork">
          <p id="headerNetworkText" style={{fontSize: "70px", fontWeight: "800", display: "inline-block", marginTop:"15px"}}>{ this.props.lang.networkStats }</p>
          <div style={{display: "inline-block", position: "relative", left: "0px", top:"-8px"}}>
            <img className="networkStatsImage" style={{height: "30px",position: "relative", top: "-14px", left: "35px"}} src={messaging}></img>
            <div style={{display: "inline-block", position: "relative", left: "45px", top:"18px"}}>
              <p className="networkStatsCounter" style={{fontSize: "24px", fontWeight: "200", display: "inline-block"}}>0</p>
              <p style={{fontSize: "18px", fontWeight: "200", position: "relative", top:"-5px", left:"1px"}}>0GB</p>
            </div>
          </div>
          <div style={{display: "inline-block", position: "relative", left: "40px", top:"-8px"}}>
            <img className="networkStatsImage" style={{height: "30px",position: "relative", top: "-14px", left: "35px"}} src={fileStorage}></img>
            <div style={{display: "inline-block", position: "relative", left: "45px", top:"18px"}}>
              <p className="networkStatsCounter" style={{fontSize: "24px", fontWeight: "200", display: "inline-block"}}>0</p>
              <p style={{fontSize: "18px", fontWeight: "200", position: "relative", top:"-5px", left:"1px"}}>0GB</p>
            </div>
          </div>
        </div>
        <div className="container" style={{margin: "0 auto", padding:"0px 0px", marginTop: "50px", width:"100%", maxWidth: "1140px"}}>
          <div className="row">
            <div className="col-sm-4 text-center">
              <p className="networkStatsChainTitle">{ this.props.lang.messagingChain }</p>
              {this.getHtmlChainInfo(false, 0, 0, 0, 0, "rgb(41,213, 90)", this.props.messagingChain ? require('../../../resources/images/connections-green.png') : require('../../../resources/images/connections-default.png'), "messagingChainCircle", "messaging")}
            </div>
            <div className="col-sm-4 text-center">
              <p className="networkStatsChainTitle">{ this.props.lang.paymentChain }</p>
                {this.getHtmlChainInfo(true, this.props.percentagePaymentChain, this.props.connectionsPayment, this.props.headersPaymentChain, this.props.blockPaymentChain, "rgb(213,149, 41)", Tools.getIconForTheme("connectionsPaymentChain", false), "paymentChainCircle")}
            </div>
            <div className="col-sm-4 text-center">
              <p className="networkStatsChainTitle">{ this.props.lang.fileStorageChain }</p>
              {this.getHtmlChainInfo(false, 0, 0, 0, 0, "rgb(32,114, 156)", this.props.fileStorage ? require('../../../resources/images/connections-blue.png') : require('../../../resources/images/connections-default.png'), "fileStorageChainCircle", "fileStorage")}
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
    percentagePaymentChain: state.chains.paymentChainSync,
    connectionsPayment: state.chains.connectionsPayment,
    blockPaymentChain: state.chains.blockPayment,
    headersPaymentChain: state.chains.headersPayment,
    messagingChain: state.chains.messagingChain,
    fileStorageChain: state.chains.fileStorageChain,
    theme: state.application.theme
  };
};

export default connect(mapStateToProps, actions)(NetworkStats);