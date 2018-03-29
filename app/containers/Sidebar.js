import React, { Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
const homedir = require('os').homedir();
const Tools = require('../utils/tools');
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
    return this.props.unlocking || this.props.sendingEcc || this.props.creatingAddress || this.props.exportingPrivateKeys || this.props.importingPrivateKey || this.props.changingPassword || this.props.closingApplication;
  }

  resize(){
    if($( window ).width() >= 1024){
      $('.sidebar').css('left', '0px');
      $('.mainSubPanel').css('padding-left', '224px');
      this.props.setSidebarHidden(false);
      $('.miniButton').css('left', '-10px');
      $('#appButtonsMac').css('left', '20px');
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
    if($(window).width() <= 1023){
      $('.miniButton').css('left', '10px');
      $('#appButtonsMac').css('left', '39px')
    }
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
            $('#appButtonsMac').css('left', '39px')
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
    window.removeEventListener('resize', this.resize);
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

    let walletStyle = "";
    let overviewStyle = "";
    let sendStyle = "";
    let addressesStyle = "";
    let transactionsStyle = "";
    let fileStorageStyle = "";
    let messagingStyle = "";
    let contactsStyle = "";
    let wallet = Tools.getIconForTheme("wallet", false);
    let overview = Tools.getIconForTheme("overview", false);
    let send = Tools.getIconForTheme("send", false);
    let addresses = Tools.getIconForTheme("addresses", false);
    let transactions = Tools.getIconForTheme("transactions", false);
    let fileStorage = Tools.getIconForTheme("fileStorage", false);
    let messaging = Tools.getIconForTheme("messaging", false);
    let contacts = Tools.getIconForTheme("contacts", false);

    if(this.props.walletHovered || this.props.walletSelected){
      wallet = Tools.getIconForTheme("wallet", true);
      walletStyle = " sidebarItemSelected";
    }
    if(this.props.overviewHovered || this.props.overviewSelected){
      overview = Tools.getIconForTheme("overview", true);
      overviewStyle = " sidebarItemSelected";
    }
    if(this.props.sendHovered || this.props.sendSelected){
      send = Tools.getIconForTheme("send", true);
      sendStyle = " sidebarItemSelected";
    }
    if(this.props.addressesHovered || this.props.addressesSelected){
      addresses = Tools.getIconForTheme("addresses", true);
      addressesStyle = " sidebarItemSelected";
    }
    if(this.props.transactionsHovered || this.props.transactionsSelected){
      transactions = Tools.getIconForTheme("transactions", true);
      transactionsStyle = " sidebarItemSelected";
    }
    if(this.props.fileStorageHovered || this.props.fileStorageSelected){
      fileStorage = Tools.getIconForTheme("fileStorage", true);
      fileStorageStyle = " sidebarItemSelected";
    }
    if(this.props.messagingHovered || this.props.messagingSelected){
      messaging = Tools.getIconForTheme("messaging", true);
      messagingStyle = " sidebarItemSelected";
    }
    if(this.props.contactsHovered || this.props.contactsSelected){
      contacts = Tools.getIconForTheme("contacts", true);
      contactsStyle = " sidebarItemSelected";
    }

    const usericon = require('../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="userimage">
          <img id="sidebarLogo" src={usericon} />
        </div>
        <ul className="sidebar-menu">
          <li className="have-children"><a href="#" onClick={this.handleClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="wallet" className={"mainOption" + walletStyle}><div className="arrowMenu"></div><img src={wallet}/><span></span>{ this.props.lang.wallet }</a> 
            <ul>
              <li><img className="sidebarImage" src={overview}/> <a className={overviewStyle} onClick={this.handleClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="overview">{ this.props.lang.overview }</a></li>
              <li><img className="sidebarImage" src={send}/> <a onClick={this.handleClicked} className={sendStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="send">{ this.props.lang.send }</a></li>
              <li><img className="sidebarImage" src={addresses}/> <a onClick={this.handleClicked} className={addressesStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="addresses"><img className="sidebarImage" src={addresses}/>{ this.props.lang.addresses }</a></li>
              <li><img className="sidebarImage" src={transactions}/>  <a onClick={this.handleClicked} className={transactionsStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="transactions">{ this.props.lang.transactions }</a></li>
            </ul>
          </li>
          <li className="have-children"><a onClick={this.handleClicked} href="#" onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="fileStorage" className={"mainOption" + fileStorageStyle}><div className="arrowMenu"></div><img src={fileStorage}/><span></span>{ this.props.lang.fileStorage }</a>
            <ul>
              <li><a href="#">{ this.props.lang.customer }</a></li>
              <li><a href="#">{ this.props.lang.viewFiles }</a></li>
              <li><a href="#">{ this.props.lang.gallery }</a></li>
              <li><a href="#">{ this.props.lang.provider }</a></li>
            </ul>
          </li>
          <li><a onClick={this.handleClicked} href="#" onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="messaging" className={"mainOption" + messagingStyle}><img src={messaging}/><span></span>{ this.props.lang.messaging }</a></li>
          <li><a onClick={this.handleClicked} className={contactsStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="contacts"><img style={{marginRight: "20px", position: "relative", top:"-2px"}} src={contacts}/>{ this.props.lang.contacts }</a></li>
        </ul>
        <div className="connections sidebar-section-container">
        <a onClick={this.handleClicked} data-id="network" style={{textDecoration: "none", cursor:"pointer"}}>
          <p style={{fontSize: "13px"}}>{`${this.props.lang.syncing} ${progressBar}%`}</p>
          <div className="progress">
            <div className="bar" style={{ width: `${progressBar}%`}}></div>
          </div>
          <p style={{fontSize: "13px"}}>{`${this.props.lang.activeConnections}: ${this.props.connections}`}</p>
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
    eccNews: state.application.showingNews,
    closingApplication: state.application.closingApplication
  };
};

export default connect(mapStateToProps, actions)(Sidebar);
