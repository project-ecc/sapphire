import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from './../Others/Header';
import Body from './../Others/Body';

import * as actions from '../../actions';

const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);
    this.getText = this.getText.bind(this);
    this.getHtmlChainInfo = this.getHtmlChainInfo.bind(this);
  }

  getPercentage(percentage){
    if(percentage === 100) return 1130;
    else if(percentage === 0) return 0;
    console.log((percentage * 1130) / 100);
    return Math.round((percentage * 1130) / 100);
  }

  getOffset(percentage){
    let len = percentage.toString().length;
    if(len === 6) return 70;
    else if(len === 5) return 55;
    else if(len === 4) return 40;
    else if(len === 3) return 30;
    else if(len === 2) return 10;
    else if(len === 1) return 0;
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
      <text style={{cursor: "pointer"}} className="enableNetwork" fill="#b4b7c8" x="50%" y="50%" dy="-15" dx="-20" textAnchor="middle">{ this.props.lang.comingSoon }</text>
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
        <p style={{fontSize:"14px", marginTop:"15px"}}>Size:<span style={{fontSize:"16px"}}>{Tools.formatBytes(this.props.sizeOnDisk)}</span></p>
      </div>
    )
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.networkStats }
        </Header>
        <Body>
          <div className="row justify-content-center">
            <div className="col-lg-6 col-xl-4 text-center">
              <p className="networkStatsChainTitle">{ this.props.lang.paymentChain }</p>
                {this.getHtmlChainInfo(true, this.props.percentagePaymentChain, this.props.connectionsPayment, this.props.headersPaymentChain, this.props.blockPaymentChain, "rgb(213,149, 41)", Tools.getIconForTheme("connectionsPaymentChain", false), "paymentChainCircle")}
            </div>
          </div>
        </Body>
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
    theme: state.application.theme,
    sizeOnDisk: state.chains.sizeOnDisk
  };
};

export default connect(mapStateToProps, actions)(Index);
