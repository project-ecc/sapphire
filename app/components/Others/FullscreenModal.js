import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CircleLoader } from 'react-spinners';
import { TweenMax } from 'gsap';
import * as actions from '../../actions/index';
import ConfirmButtonPopup from './ConfirmButtonPopup';
import $ from 'jquery';
const event = require('../../utils/eventhandler');
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap';

class FullscreenModal extends Component {

  constructor(props) {
    super(props);
    this.showLoadingBlockIndex = this.showLoadingBlockIndex.bind(this);
    this.showPercentage = this.showPercentage.bind(this);
    this.handleDismissUpdateFailed = this.handleDismissUpdateFailed.bind(this);
    this.showdownloadFailed = this.showdownloadFailed.bind(this);

    this.state = {
      open: false,
      title: '',
      message: ''
    }
  }

  show ({title, message}) {
    this.setState({
      open: true,
      title: title,
      message: message
    });
  }

  close () {
    this.setState({
      open: false
    });
  }

  shouldComponentUpdate(nextProps) {
  	if (!this.props.loading && nextProps.loading) {
  		this.showLoadingBlockIndex();
  		return true;
  	}  	else if (!this.props.downloadMessage && nextProps.downloadMessage) {
  		this.showDownloadingMessage();
  		setTimeout(() => this.showPercentage(), 500);
  	}  	else if (!this.props.updateFailed && nextProps.updateFailed) {
    setTimeout(() => {
      this.showdownloadFailed();
    }, 1000);
  }
  	return true;
  }

  handleDismissUpdateFailed() {
    this.props.settellUserUpdateFailed(false);
    this.props.setUpdatingApplication(false);
    this.props.wallet.walletstart((result) => {
      if (result) {
        console.log('started daemon');
      }
    }).catch(err => {
      event.emit('loading-error', { message: err.message });
    });

    if (this.props.guiUpdate) {
      event.emit('runMainCycle');
    }
  }

  componentDidMount() {
  	// fix for when importing a wallet with the setup done, without this the "loading" text doesn't show up, since the prop is already set to true
  	if (this.props.loading && $(this.refs.blockIndexLoad).css('visibility') == 'hidden') {
  		this.showLoadingBlockIndex();
  	}
  }

  showPercentage() {
  	TweenMax.set('.loadingDownloadPercentage', { css: { display: 'block' } });
	  TweenMax.fromTo('.loadingDownloadPercentage', 0.2, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1 });
  }

  showDownloadingMessage() {
	  TweenMax.fromTo('.loadingDownloadMessage', 0.2, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1 });
  }

  showLoadingBlockIndex() {
    TweenMax.to(['#gettingReady', '.loadingDownloadMessage', '.loadingDownloadPercentage'], 0.2, { autoAlpha: 0, scale: 0.5 });
    TweenMax.to('#blockIndexLoad', 0.2, { autoAlpha: 1, scale: 1 });
  }

  showdownloadFailed() {
    TweenMax.set('.showDismissButton', { css: { display: 'block', autoAlpha: 0, textAlign: 'center' } });
    TweenMax.fromTo('.showDismissButton', 0.2, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1 });
  }

  render() {
    return (
      <Modal isOpen={this.state.open} id="fullscreenModal">
        <ModalHeader>
          { this.props.header }
        </ModalHeader>
        <ModalBody>
          { this.props.body }
        </ModalBody>
        <ModalFooter>
          { this.props.footer }
        </ModalFooter>
      </Modal>
      // <div id="loader">
      //   <CircleLoader size={150} color="#d09128" />
      //   <div className="text">
      //     <div id="blockIndexLoad" ref="blockIndexLoad">
      //       <p style={{ fontSize: '45px', fontWeight: 'bold' }}>{ this.props.lang.loading }</p>
      //       <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{this.props.loadingMessage }</p>
      //     </div>
      //     <p style={{ marginTop: '-50px', fontWeight: '300', visibility: 'hidden' }} id="gettingReady">{ this.props.lang.mainMessage }</p>
      //     <p />
      //     <p className="loadingDownloadMessage">{this.props.downloadMessage}</p>
      //     <p className="loadingDownloadPercentage">{this.props.percentage != null ? `${this.props.percentage}%` : null}</p>
      //     <div className="showDismissButton">
      //       <p style={{ fontSize: '18px', fontWeight: '400', paddingTop: '13px' }}>{this.props.lang.updateFailed}</p>
      //       <ConfirmButtonPopup style={{ margin: '0 auto', position: 'relative', top: '21px' }} handleConfirm={this.handleDismissUpdateFailed} text={this.props.lang.dismiss} />
      //     </div>
      //   </div>
      // </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    loadingMessage: state.startup.loadingMessage,
    loading: state.startup.loading,
    updatingApplication: state.startup.updatingApp,
    downloadMessage: state.application.downloadMessage,
    percentage: state.application.downloadPercentage,
    updateFailed: state.application.updateFailed,
    wallet: state.application.wallet,
    guiUpdate: state.startup.guiUpdate
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(FullscreenModal);
