import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize)
  }

  resize(){
    if($( window ).width() >= 1024){
      $('.sidebar').css('left', '0px');
      $('.my_wrapper').css('padding-left', '224px');
      this.props.setSidebarHidden(false);
      $('.miniButton').css('left', '-10px');
      if(!this.props.unlocking && !this.props.sendingEcc && !this.props.creatingAddress && !this.props.exportingPrivateKeys){
        TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
        TweenMax.set($('.mancha'), { zIndex:11});
      }
    }
    else if($( window ).width() <= 1023){
      $('.sidebar').css('left', '-224px');
      $('.my_wrapper').css('padding-left', '0px');
      this.props.setSidebarHidden(true);
      if(!this.props.unlocking && !this.props.sendingEcc && !this.props.creatingAddress && !this.props.exportingPrivateKeys){
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
            $('.my_wrapper').css('padding-left', '0px');
            self.props.setSidebarHidden(true);
            $('.miniButton').css('left', '10px');
          }, 500)
      }
      $(".sidebar-menu > li.have-children a.mainOption").on("click", function(i){
          i.preventDefault();
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
        if(offset < 0 && !self.props.unlocking && !self.props.sendingEcc && !self.props.creatingAddress){
          if(self.props.settings)
            self.props.setSettings(false);
          $('.sidebar').css('left', '0px');
          TweenMax.set($('.mancha'), { zIndex:3});
          TweenMax.set($('.mancha'), {css: {display: "block"}})
          TweenMax.fromTo($('.mancha'), 0.3, {autoAlpha:0}, { autoAlpha:1, ease: Linear.easeNone});
        }
        else if(!self.props.unlocking && !self.props.sendingEcc && !self.props.creatingAddress){
          $('.sidebar').css('left', '-224px');
          $('.my_wrapper').css('padding-left', '0px');
          TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
          TweenMax.set($('.mancha'), { zIndex:8, delay: 0.3});
        }
      })
    });
  }

  componentWillUnmount() {
  }

  toggleHover(e){
    this.props.hoveredSideBar(e.currentTarget.dataset.id);
  }

  toggleUnhover(e){
    this.props.unhoveredSideBar(e.currentTarget.dataset.id);
  }

  handleClicked(e){
    const page = e.currentTarget.dataset.id;
    if(page == "wallet" || page == "fileStorage") return;
    if(this.props.settings)
      this.props.setSettings(false);
    this.props.selectedSideBar(page);
    if($( window ).width() <= 1023){
      $('.sidebar').css('left', '-224px');
      $('.my_wrapper').css('padding-left', '0px');
      TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
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
    let fileStorage = require('../../resources/images/fileStorage-blue.png');
    let messaging = require('../../resources/images/messaging-blue.png');
    let contacts = require('../../resources/images/contacts-blue.png');

    if(this.props.walletHovered || this.props.walletSelected && !this.props.settings){
      wallet = require('../../resources/images/wallet-orange.png');
      walletStyle = {color: "#d09128"};
    }
    if(this.props.overviewHovered || this.props.overviewSelected && !this.props.settings){
      overview = require('../../resources/images/overview-orange.png');
      overviewStyle = {color: "#d09128"};
    }    
    if(this.props.sendHovered || this.props.sendSelected && !this.props.settings){
      send = require('../../resources/images/send-orange.png');
      sendStyle = {color: "#d09128"};
    }
    if(this.props.addressesHovered || this.props.addressesSelected && !this.props.settings){
      addresses = require('../../resources/images/addresses-orange.png');
      addressesStyle = {color: "#d09128"};
    }
    if(this.props.transactionsHovered || this.props.transactionsSelected && !this.props.settings){
      transactions = require('../../resources/images/transactions-orange.png');
      transactionsStyle = {color: "#d09128"};
    }
    if(this.props.fileStorageHovered || this.props.fileStorageSelected && !this.props.settings){
      fileStorage = require('../../resources/images/fileStorage-orange.png');
      fileStorageStyle = {color: "#d09128"};
    }
    if(this.props.messagingHovered || this.props.messagingSelected && !this.props.settings){
      messaging = require('../../resources/images/messaging-orange.png');
      messagingStyle = {color: "#d09128"};
    }
    if(this.props.contactsHovered || this.props.contactsSelected && !this.props.settings){
      contacts = require('../../resources/images/contacts-orange.png');
      contactsStyle = {color: "#d09128"};
    }

    const usericon = require('../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="userimage">
          <img src={usericon} />
        </div>
        <ul className="sidebar-menu">
          <li className="have-children"><a style={walletStyle} href="#" onClick={this.handleClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="wallet" className="mainOption"><div className="arrowMenu"></div><img src={wallet}/><span></span>Wallet</a> 
            <ul>
              <li><img className="sidebarImage" src={overview}/> <Link to="/" onClick={this.handleClicked} style={overviewStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="overview"> Overview</Link></li>
              <li><img className="sidebarImage" src={send}/> <Link to="/send" onClick={this.handleClicked} style={sendStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="send">Send</Link></li>
              <li><img className="sidebarImage" src={addresses}/> <Link to="/receive" onClick={this.handleClicked} style={addressesStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="addresses"><img className="sidebarImage" src={addresses}/> Addresses</Link></li>
              <li><img className="sidebarImage" src={transactions}/>  <Link to="/transaction" onClick={this.handleClicked} style={transactionsStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="transactions">Transactions</Link></li>
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
          <li><Link to="/contacts" onClick={this.handleClicked} style={contactsStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="contacts"><img style={{marginRight: "20px", position: "relative", top:"-2px"}} src={contacts}/>Contacts</Link></li>
        </ul>
        <div className="connections sidebar-section-container">
        <Link to="/networkStats"  onClick={this.handleClicked} style={{textDecoration: "none"}}>
          <p style={{fontSize: "13px", color: "#b4b7c8", fontWeight: "600"}}>{`${this.props.lang.nabBarNetworkInfoSyncing} ${progressBar}%`}</p>
          <div className="progress">
            <div className="bar" style={{ width: `${progressBar}%`, backgroundColor: '#d09128' }}></div>
          </div>
          <p style={{fontSize: "13px", color: "#b4b7c8", fontWeight: "600"}}>{`${this.props.lang.nabBarNetworkInfoActiveConnections}: ${this.props.connections}`}</p>
          </Link>
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
    exportingPrivateKeys: state.application.exportingPrivateKeys
  };
};

export default connect(mapStateToProps, actions)(Sidebar);
