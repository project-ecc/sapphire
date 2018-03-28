import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';

class NetworkStats extends Component {
  constructor(props) {
    super(props);
    this.getText = this.getText.bind(this);
    this.getHtmlChainInfo = this.getHtmlChainInfo.bind(this);
  }

  getPercentage(percentage){
    if(percentage == 100) return 2000;
    else if(percentage == 0) return 0;

    return Math.round((percentage * 2000) / 100);
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
      <text style={{cursor: "pointer"}} onClick={this.processChainClick.bind(this, operation)} className="enableNetwork" fill="#b4b7c8" x="50%" y="50%" dy="-15" dx="-20" textAnchor="middle">{ this.props.lang.enable }</text>
    )
  }

  getHtmlChainInfo(enabled, percentage, connections, headers, block, color, rgbColor, imageConnections, operation = ""){
    return(
      <div className="chainInfo" style={{position: "relative", paddingTop: "30px"}}>
        <svg style={{maxWidth:"216px", maxHeight: "230px"}} className="score" width="100%" height="400" viewBox="-25 -25 400 400">
        <circle className="score-empty" cx="175" cy="175" r="180" strokeWidth="5px" fill="none"></circle>
        <defs>
          <filter id="sofGlow" height="300%" width="300%" x="-75%" y="-75%">
            <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
            <feGaussianBlur in="thicken" stdDeviation="2" result="blurred" />
            <feFlood floodColor={rgbColor} result="glowColor" />
            <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
            <feMerge>
              <feMergeNode in="softGlow_colored"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle filter="url(#sofGlow)" className="js-circle score-circle" transform="rotate(-90 175 175)" cx="175" cy="175" r="180" strokeDasharray="2000" strokeWidth="5px" strokeDashoffset={this.getPercentage(100-percentage)} fill="none" stroke={color}></circle>
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
    let fileStorage = require('../../../resources/images/file-storage-blue.ico');
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
        <div className="container" style={{marginTop: "50px", width:"100%"}}>
          <div className="row">
            <div className="col-sm-4 text-center">
              <p className="networkStatsChainTitle">{ this.props.lang.messagingChain }</p>
              {this.getHtmlChainInfo(this.props.messagingChain, 0, 0, 0, 0, "#29d55a", "rgb(41,213, 90)", this.props.messagingChain ? require('../../../resources/images/connections-green.png') : require('../../../resources/images/connections-default.png'), "messaging")}
            </div>
            <div className="col-sm-4 text-center">
              <p className="networkStatsChainTitle">{ this.props.lang.paymentChain }</p>
                {this.getHtmlChainInfo(true, this.props.percentagePaymentChain, this.props.connectionsPayment, this.props.headersPaymentChain, this.props.blockPaymentChain, this.props.theme == "default" ? "#d59529" : "#c39c59", "rgb(213,149, 41)", require('../../../resources/images/connections-orange.png'))}
            </div>
            <div className="col-sm-4 text-center">
              <p className="networkStatsChainTitle">{ this.props.lang.fileStorageChain }</p>
              {this.getHtmlChainInfo(this.props.fileStorageChain, 0, 0, 0, 0, "#20729c", "rgb(32,114, 156)", this.props.fileStorage ? require('../../../resources/images/connections-blue.png') : require('../../../resources/images/connections-default.png'), "fileStorage")}
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