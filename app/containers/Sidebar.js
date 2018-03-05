import React, { Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
const homedir = require('os').homedir();
import * as actions from '../actions';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.toggleHover = this.toggleHover.bind(this);
    this.toggleUnhover = this.toggleUnhover.bind(this);
    this.handleClicked = this.handleClicked.bind(this);
    this.checkPopupActive = this.checkPopupActive.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize)
  }

  checkPopupActive(){
    return this.props.unlocking || this.props.sendingEcc || this.props.creatingAddress || this.props.exportingPrivateKeys || this.props.importingPrivateKey || this.props.changingPassword;
  }

  resize(){
    if($( window ).width() >= 1024){
      $('.sidebar').css('left', '0px');
      $('.mainSubPanel').css('padding-left', '224px');
      this.props.setSidebarHidden(false);
      $('.miniButton').css('left', '-10px');
      if(!this.checkPopupActive()){
        TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
        TweenMax.set($('.mancha'), { zIndex:11});
      }
    }
    else if($( window ).width() <= 1023){
      $('.sidebar').css('left', '-224px');
      $('.mainSubPanel').css('padding-left', '0px');
      this.props.setSidebarHidden(true);
      if(!this.checkPopupActive()){
        TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
        TweenMax.set($('.mancha'), { zIndex:11});
      }
    }
    if($(window).width() <= 1023)
      $('.miniButton').css('left', '10px');
  }

  componentDidMount() {
    var self = this;
    $(document).ready(function(){
      if($( window ).width() <= 1023){
          setTimeout(() => {
            $('.sidebar').css('left', '-224px');
            $('.mainSubPanel').css('padding-left', '0px');
            self.props.setSidebarHidden(true);
            $('.miniButton').css('left', '10px');
          }, 500)
      }
      $(".sidebar-menu > li.have-children a.mainOption").on("click", function(i){
          i.stopPropagation();
        if( ! $(this).parent().hasClass("active") ){
          $(".sidebar-menu li ul").slideUp();
          $(this).next().slideToggle();
          $(".sidebar-menu li").removeClass("active");
          $(this).parent().addClass("active");
          $($($(this).parent().siblings().children()[0]).children()[0]).css("transform", "rotate(135deg)");
          $($(this).children()[0]).css("transform", "rotate(315deg)");
        }
        else{
          $(this).next().slideToggle();
          $(".sidebar-menu li").removeClass("active");
          $($(this).children()[0]).css("transform", "rotate(135deg)");
        }
        });
      $('.miniButton').on('click', function(){
        var offset = $('.sidebar').offset().left;
        if(offset < 0 && !self.checkPopupActive()){
          $('.sidebar').css('left', '0px');
          //TweenMax.set($('.mancha'), { zIndex:3});
          //TweenMax.set($('.mancha'), {css: {display: "block"}})
          //TweenMax.fromTo($('.mancha'), 0.3, {autoAlpha:0}, { autoAlpha:1, ease: Linear.easeNone});
        }
        else if(!self.checkPopupActive()){
          $('.sidebar').css('left', '-224px');
          $('.mainSubPanel').css('padding-left', '0px');
          //TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
          //TweenMax.set($('.mancha'), { zIndex:8, delay: 0.3});
        }
      })
    });
    this.subscribeToEvent();
  }

  subscribeToEvent(){
    var self = this;
    $(window).on("click", function(e) {
      if($(e.target).is('.sidebar') || $(e.target).is('#sidebarLogo') || $(e.target).is('.userimage')) {
        return;
      }
      var offset = $('.sidebar').offset().left;
      if($( window ).width() <= 1023 && offset == 0){
        $('.sidebar').css('left', '-224px');
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
    $( window ).off('click');
    $('.miniButton').css('left', '-10px');
  }

  toggleHover(e){
    this.props.hoveredSideBar(e.currentTarget.dataset.id);
  }

  toggleUnhover(e){
    this.props.unhoveredSideBar(e.currentTarget.dataset.id);
  }

  handleClicked(e){
    const page = e.currentTarget.dataset.id;
    const parent = e.currentTarget.dataset.parent;
    if(page == "wallet" || page == "fileStorage") return;
    if(this.props.settings)
      this.props.setSettings(false);
    this.props.selectedSideBar(this.getParent(page), page);
    this.props.setSelectedPanel(page);
    if($( window ).width() <= 1023){
      $('.sidebar').css('left', '-224px');
      $('.mainSubPanel').css('padding-left', '0px');
      TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
    }
  }

  getParent(page){
    if(page == "overview" || page == "send" || page == "addresses" || page == "transactions"){
      return "wallet";
    }
    else if(page == "contacts"){
      return undefined;
    }
  }

  render() {
    let progressBar = this.props.paymentChainSync;

    let walletStyle = {};
    let overviewStyle = {};
    let sendStyle = {};
    let addressesStyle = {};
    let transactionsStyle = {};
    let fileStorageStyle = {};
    let messagingStyle = {};
    let contactsStyle = {};
    let wallet = require('../../resources/images/wallet-blue.png');
    let overview = require('../../resources/images/overview-blue.png');
    let send = require('../../resources/images/send-blue.png');
    let addresses = require('../../resources/images/addresses-blue.png');
    let transactions = require('../../resources/images/transactions-blue.png');
    let fileStorage = require('../../resources/images/fileStorage-default.png');
    let messaging = require('../../resources/images/messaging-default.png');
    let contacts = require('../../resources/images/contacts-blue.png');

    if(this.props.walletHovered || this.props.walletSelected){
      wallet = require('../../resources/images/wallet-orange.png');
      walletStyle = {color: "#d09128"};
    }
    if(this.props.overviewHovered || this.props.overviewSelected){
      overview = require('../../resources/images/overview-orange.png');
      overviewStyle = {color: "#d09128"};
    }    
    if(this.props.sendHovered || this.props.sendSelected){
      send = require('../../resources/images/send-orange.png');
      sendStyle = {color: "#d09128"};
    }
    if(this.props.addressesHovered || this.props.addressesSelected){
      addresses = require('../../resources/images/addresses-orange.png');
      addressesStyle = {color: "#d09128"};
    }
    if(this.props.transactionsHovered || this.props.transactionsSelected){
      transactions = require('../../resources/images/transactions-orange.png');
      transactionsStyle = {color: "#d09128"};
    }
    if(this.props.fileStorageHovered || this.props.fileStorageSelected){
      fileStorage = require('../../resources/images/fileStorage-orange.png');
      fileStorageStyle = {color: "#d09128"};
    }
    if(this.props.messagingHovered || this.props.messagingSelected){
      messaging = require('../../resources/images/messaging-orange.png');
      messagingStyle = {color: "#d09128"};
    }
    if(this.props.contactsHovered || this.props.contactsSelected){
      contacts = require('../../resources/images/contacts-orange.png');
      contactsStyle = {color: "#d09128"};
    }

    const usericon = require('../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="userimage">
          <img id="sidebarLogo" src={usericon} />
        </div>
        <ul className="sidebar-menu">
          <li className="have-children"><a style={walletStyle} href="#" onClick={this.handleClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="wallet" className="mainOption"><div className="arrowMenu"></div><img src={wallet}/><span></span>Wallet</a> 
            <ul>
              <li><img className="sidebarImage" src={overview}/> <a onClick={this.handleClicked} style={overviewStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="overview"> Overview</a></li>
              <li><img className="sidebarImage" src={send}/> <a onClick={this.handleClicked} style={sendStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="send">Send</a></li>
              <li><img className="sidebarImage" src={addresses}/> <a onClick={this.handleClicked} style={addressesStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="addresses"><img className="sidebarImage" src={addresses}/> Addresses</a></li>
              <li><img className="sidebarImage" src={transactions}/>  <a onClick={this.handleClicked} style={transactionsStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="transactions">Transactions</a></li>
            </ul>
          </li>
          <li className="have-children"><a onClick={this.handleClicked} style={fileStorageStyle} href="#" onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="fileStorage" className="mainOption"><div className="arrowMenu"></div><img src={fileStorage}/><span></span>File Storage</a>
            <ul>
              <li><a href="#">Customer</a></li>
              <li><a href="#">View Files</a></li>
              <li><a href="#">Gallery</a></li>
              <li><a href="#">Provider</a></li>
            </ul>
          </li>
          <li><a onClick={this.handleClicked} style={messagingStyle} href="#" onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="messaging" className="mainOption"><img src={messaging}/><span></span>Messaging</a></li>
          <li><a onClick={this.handleClicked} style={contactsStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="contacts"><img style={{marginRight: "20px", position: "relative", top:"-2px"}} src={contacts}/>Contacts</a></li>
        </ul>
        <div className="connections sidebar-section-container">
        <a onClick={this.handleClicked} data-id="network" style={{textDecoration: "none", cursor:"pointer"}}>
          <p style={{fontSize: "13px", color: "#b4b7c8", fontWeight: "600"}}>{`${this.props.lang.nabBarNetworkInfoSyncing} ${progressBar}%`}</p>
          <div className="progress">
            <div className="bar" style={{ width: `${progressBar}%`, backgroundColor: '#d09128' }}></div>
          </div>
          <p style={{fontSize: "13px", color: "#b4b7c8", fontWeight: "600"}}>{`${this.props.lang.nabBarNetworkInfoActiveConnections}: ${this.props.connections}`}</p>
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    walletHovered: state.sideBar.walletHovered,
    overviewHovered: state.sideBar.overviewHovered,
    sendHovered: state.sideBar.sendHovered,
    addressesHovered: state.sideBar.addressesHovered,
    transactionsHovered: state.sideBar.transactionsHovered,
    fileStorageHovered: state.sideBar.fileStorageHovered,
    messagingHovered: state.sideBar.messagingHovered,
    contactsHovered: state.sideBar.contactsHovered,
    walletSelected: state.sideBar.walletSelected,
    overviewSelected: state.sideBar.overviewSelected,
    sendSelected: state.sideBar.sendSelected,
    addressesSelected: state.sideBar.addressesSelected,
    transactionsSelected: state.sideBar.transactionsSelected,
    fileStorageSelected: state.sideBar.fileStorageSelected,
    messagingSelected: state.sideBar.messagingSelected,
    contactsSelected: state.sideBar.contactsSelected,
    unlocking: state.application.unlocking,
    sendingEcc: state.application.sendingEcc,
    creatingAddress: state.application.creatingAddress,
    connections: state.chains.connections,
    paymentChainSync: state.chains.paymentChainSync,
    settings: state.application.settings,
    exportingPrivateKeys: state.application.exportingPrivateKeys,
    importingPrivateKey: state.application.importingPrivateKey,
    changingPassword: state.application.changingPassword,
    eccNews: state.application.showingNews
  };
};

export default connect(mapStateToProps, actions)(Sidebar);
