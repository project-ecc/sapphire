import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";
import * as actions from '../../actions';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup'
import $ from 'jquery';
const lang = traduction();
const Tools = require('../../utils/tools');
const event = require('../../utils/eventhandler');
class Loader extends React.Component {

 constructor(props) {
    super(props);
    this.showLoadingBlockIndex = this.showLoadingBlockIndex.bind(this);
    this.showPercentage = this.showPercentage.bind(this);
    this.handleDismissUpdateFailed = this.handleDismissUpdateFailed.bind(this);
    this.showdownloadFailed = this.showdownloadFailed.bind(this);
  }

  shouldComponentUpdate(nextProps){
   console.log(nextProps)
  	if(!this.props.loading && nextProps.loading){
  		this.showLoadingBlockIndex();
  		return true;
  	}
  	else if(!this.props.downloadMessage && nextProps.downloadMessage){
  		this.showDownloadingMessage();
  		setTimeout(() => this.showPercentage(), 500);
  	}
  	else if(!this.props.updateFailed && nextProps.updateFailed) {
      setTimeout(() => {
        this.showdownloadFailed()
      }, 1000);

    }
  	return true;
  }

  handleDismissUpdateFailed() {
    this.props.settellUserUpdateFailed(false);
    this.props.setUpdatingApplication(false);
    Tools.showFunctionIcons();
    this.props.setShowingFunctionIcons(true);
    this.props.wallet.walletstart((result) => {
      if (result) {
        console.log("started daemon")
      }
    });

    if(this.props.guiUpdate){
      event.emit('runMainCycle');
    }
  }


  showMessage(message){
  	$('#gettingReady').text(message);
	TweenMax.to(['#blockIndexLoad'], 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.fromTo('#message', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  componentWillMount(){
  	if(this.props.showingFunctionIcons){
  	  Tools.hideFunctionIcons();
      this.props.setShowingFunctionIcons(false);
  	}
  }

  componentDidMount(){
  	//fix for when importing a wallet with the setup done, without this the "loading" text doesn't show up, since the prop is already set to true
  	if(this.props.loading && $(this.refs.blockIndexLoad).css('visibility') == "hidden"){
  		this.showLoadingBlockIndex();
  	}
  }

  showPercentage(){
  	TweenMax.set('.loadingDownloadPercentage', {css:{display: "block"}})
	  TweenMax.fromTo('.loadingDownloadPercentage', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  showDownloadingMessage(){
	  TweenMax.fromTo('.loadingDownloadMessage', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  showLoadingBlockIndex(){
    TweenMax.to(['#gettingReady', '.loadingDownloadMessage', '.loadingDownloadPercentage'], 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#blockIndexLoad', 0.2, {autoAlpha: 1, scale: 1});
  }

  showdownloadFailed() {
    TweenMax.set('.showDismissButton', {css:{display: "block", autoAlpha: 0, textAlign: "center"}})
    TweenMax.fromTo('.showDismissButton', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  render() {
   console.log(this.props.loadingMessage)
    return (
      <div>
			<svg version="1.1" id="logoLoader" x="0px" y="0px" viewBox="0 0 1200 1200" style={{enableBackground:"new 0 0 1200 1200"}}>
 				<filter id="black">
			        <feOffset result="offOut" in="SourceAlpha" dx="0" dy="-20"/>
			        <feColorMatrix in="offOut" result="matrixOut" type="matrix"
			                                     values="0 0 0 0 0
			                                             0 0 0 0 0
			                                             0 0 0 0 0
			                                             0 0 0 1 0" />
			        <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="10"/>
			        <feBlend in="SourceGraphic" in2="blurOut" mode="normal"/>
		  		</filter>
 				<filter id="yellow">
			        <feOffset result="offOut" in="SourceAlpha" dx="0" dy="-20"/>
			        <feColorMatrix in="offOut" result="matrixOut" type="matrix"
			                                     values="0 0 0 0 1
	                                                0 0 0 0 0.4
	                                                0 0 0 0 -0.5
	                                                0 0 0 1 0" />
			        <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="15"/>
			        <feBlend in="SourceGraphic" in2="blurOut" mode="normal"/>
		  		</filter>
				<g ref="logo1" id="logo1" filter="url(#black)" transform="scale(1,-1) translate(0,-1200)">
						<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31765.793 -88605.3125)">
						<stop  offset="0" style={{stopColor:"#1A304A"}}/>
						<stop  offset="1" style={{stopColor:"#1A304A"}}/>
					</linearGradient>
					<path className="st0" d="M699.3,47.9L365.2,293.3l-9.4,134c0,21.3,13,30,40.7,30l343.3-231.5V81.7C739.9,58.7,730.8,47.9,699.3,47.9z"
						/>
						<linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31765.793 -88367.4531)">
						<stop  offset="0" style={{stopColor:"#1A304A"}}/>
						<stop  offset="1" style={{stopColor:"#101D2D"}}/>
					</linearGradient>
					<path className="st1" d="M699.3,695.2L355.8,445.1V315.8c0-21.3,13-30,40.7-30l343.3,231.5v144.1C739.9,684.4,730.8,695.2,699.3,695.2z
						"/>
						<linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5239" x2="-81.2865" y2="217.5139" gradientTransform="matrix(384.0482 0 0 412.3166 31772.2949 -88771.1016)">
						<stop  offset="0" style={{stopColor:"#F29D26"}}/>
						<stop  offset="1" style={{stopColor:"#986317"}}/>
					</linearGradient>
					<path className="st2" d="M705.8,505.3L371.7,752.4l-9.4,135c0,21.4,13,30.2,40.7,30.2l343.3-233.2V539.3
						C746.4,516.1,737.3,505.3,705.8,505.3z"/>
						<linearGradient id="SVGID_4_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31770.4023 -87907.5469)">
						<stop  offset="0" style={{stopColor:"#F29D26"}}/>
						<stop  offset="1" style={{stopColor:"#A06719"}}/>
					</linearGradient>
					<path className="st3" d="M703.9,1155.1L360.5,905V775.7c0-21.3,13-30,40.7-30l343.3,231.5v144.1
						C744.5,1144.3,735.4,1155.1,703.9,1155.1z"/>
				</g>
				<g id="logo2" filter="url(#yellow)" transform="scale(1,-1) translate(0,-1200)">
						<linearGradient id="forth_1_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31765.793 -88605.3125)">
						<stop  offset="0" style={{stopColor:"#1A304A"}}/>
						<stop  offset="1" style={{stopColor:"#1A304A"}}/>
					</linearGradient>
					<path id="forth" className="st4" d="M699.3,47.9L365.2,293.3l-9.4,134c0,21.3,13,30,40.7,30l343.3-231.5V81.7
						C739.9,58.7,730.8,47.9,699.3,47.9z"/>
						<linearGradient id="third_1_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31765.793 -88367.4531)">
						<stop  offset="0" style={{stopColor:"#1A304A"}}/>
						<stop  offset="1" style={{stopColor:"#101D2D"}}/>
					</linearGradient>
					<path id="third" className="st5" d="M699.3,695.2L355.8,445.1V315.8c0-21.3,13-30,40.7-30l343.3,231.5v144.1
						C739.9,684.4,730.8,695.2,699.3,695.2z"/>
						<linearGradient id="second_1_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5239" x2="-81.2865" y2="217.5139" gradientTransform="matrix(384.0482 0 0 412.3166 31772.2949 -88771.1016)">
						<stop  offset="0" style={{stopColor:"#F29D26"}}/>
						<stop  offset="1" style={{stopColor:"#986317"}}/>
					</linearGradient>
					<path id="second" className="st6" d="M705.8,505.3L371.7,752.4l-9.4,135c0,21.4,13,30.2,40.7,30.2l343.3-233.2V539.3
						C746.4,516.1,737.3,505.3,705.8,505.3z"/>
						<linearGradient id="first_1_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31770.4023 -87907.5469)">
						<stop  offset="0" style={{stopColor:"#F29D26"}}/>
						<stop  offset="1" style={{stopColor:"#A06719"}}/>
					</linearGradient>
					<path id="first" className="st7" d="M703.9,1155.1L360.5,905V775.7c0-21.3,13-30,40.7-30l343.3,231.5v144.1
						C744.5,1144.3,735.4,1155.1,703.9,1155.1z"/>
				</g>
				<g id="logo3" transform="scale(1,-1) translate(0,-1200)">
						<linearGradient id="SVGID_5_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31765.793 -88605.3125)">
						<stop  offset="0" style={{stopColor:"#1A304A"}}/>
						<stop  offset="1" style={{stopColor:"#1A304A"}}/>
					</linearGradient>
					<path className="st8" d="M699.3,47.9L365.2,293.3l-9.4,134c0,21.3,13,30,40.7,30l343.3-231.5V81.7C739.9,58.7,730.8,47.9,699.3,47.9z"/>
						<linearGradient id="SVGID_6_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31765.793 -88367.4531)">
						<stop  offset="0" style={{stopColor:"#1A304A"}}/>
						<stop  offset="1" style={{stopColor:"#101D2D"}}/>
					</linearGradient>
					<path className="st9" d="M699.3,695.2L355.8,445.1V315.8c0-21.3,13-30,40.7-30l343.3,231.5v144.1C739.9,684.4,730.8,695.2,699.3,695.2z"/>
						<linearGradient id="SVGID_7_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5239" x2="-81.2865" y2="217.5139" gradientTransform="matrix(384.0482 0 0 412.3166 31772.2949 -88771.1016)">
						<stop  offset="0" style={{stopColor:"#F29D26"}}/>
						<stop  offset="1" style={{stopColor:"#986317"}}/>
					</linearGradient>
					<path className="st10" d="M705.8,505.3L371.7,752.4l-9.4,135c0,21.4,13,30.2,40.7,30.2l343.3-233.2V539.3 C746.4,516.1,737.3,505.3,705.8,505.3z"/>
						<linearGradient id="SVGID_8_" gradientUnits="userSpaceOnUse" x1="-81.2865" y1="216.5276" x2="-81.2865" y2="217.5276" gradientTransform="matrix(384.0482 0 0 409.4315 31770.4023 -87907.5469)">
						<stop  offset="0" style={{stopColor:"#F29D26"}}/>
						<stop  offset="1" style={{stopColor:"#A06719"}}/>
					</linearGradient>
					<path className="st11" d="M703.9,1155.1L360.5,905V775.7c0-21.3,13-30,40.7-30l343.3,231.5v144.1
						C744.5,1144.3,735.4,1155.1,703.9,1155.1z"/>
				</g>
			</svg>
			<div id="loaderText" style={{marginTop: "15px"}}>
				<div id="blockIndexLoad" ref="blockIndexLoad">
					<p id="loading" style={{fontSize: "45px", fontWeight: "bold"}}>{ this.props.lang.loading }</p>
					<p id="loading" style={{fontSize: "15px", fontWeight: "bold"}}>{this.props.loadingMessage }</p>
				</div>
				<p style={{marginTop: "-50px", fontWeight:"300", visibility:"hidden"}} id="gettingReady">{ this.props.lang.mainMessage }</p>
    			<p className="loadingDownloadMessage">{this.props.downloadMessage}</p>
    			<p className="loadingDownloadPercentage">{this.props.percentage != null ?  this.props.percentage + '%' : null}</p>
        <div style={{display: "none", margin: "auto", textAlign:"center"}} className="showDismissButton">
          <p style={{  fontSize: "18px", fontWeight: "400", paddingTop: "13px"}}>{this.props.lang.updateFailed}</p>
          <ConfirmButtonPopup style={{margin: "0 auto", position: "relative", top: "21px"}} handleConfirm={this.handleDismissUpdateFailed} text={ this.props.lang.dismiss }/>
        </div>
			</div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    loadingMessage: state.startup.loadingMessage,
    loading: state.startup.loading,
    updatingApplication: state.startup.updatingApp,
    showingFunctionIcons: state.application.showingFunctionIcons,
    downloadMessage: state.application.downloadMessage,
    percentage: state.application.downloadPercentage,
    updateFailed: state.application.updateFailed,
    wallet: state.application.wallet,
    guiUpdate: state.startup.guiUpdate
  };
};



export default connect(mapStateToProps, actions, null)(Loader);
