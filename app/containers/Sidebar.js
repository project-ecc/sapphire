import React, { Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import * as actions from '../actions';
import ReactTooltip from 'react-tooltip';
import { CurrencyUsdIcon, SendIcon, FormatListBulletedIcon, ContactsIcon, ForumIcon } from 'mdi-react';

const homedir = require('os').homedir();
const Tools = require('../utils/tools');

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.toggleHover = this.toggleHover.bind(this);
    this.toggleUnhover = this.toggleUnhover.bind(this);
    this.handleClicked = this.handleClicked.bind(this);
    this.checkPopupActive = this.checkPopupActive.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
  }

  checkPopupActive() {
    return this.props.unlocking || this.props.sendingEcc || this.props.creatingAddress || this.props.exportingPrivateKeys || this.props.importingPrivateKey || this.props.changingPassword || this.props.closingApplication;
  }

  resize() {
    if ($(window).width() >= 1024) {
      $('.sidebar').removeClass('hide');
      $('.mainSubPanel').css('padding-left', '224px');
      this.props.setSidebarHidden(false);
      $('#appButtonsMac').css('left', '20px');
      if (!this.checkPopupActive()) {
        TweenMax.to($('.mancha'), 0.3, { autoAlpha: 0, ease: Linear.easeNone });
        TweenMax.set($('.mancha'), { zIndex: 11 });
      }
    } else if ($(window).width() <= 1023) {
      $('.sidebar').addClass('hide');
      $('.mainSubPanel').css('padding-left', '0px');
      this.props.setSidebarHidden(true);
      if (!this.checkPopupActive()) {
        TweenMax.to($('.mancha'), 0.3, { autoAlpha: 0, ease: Linear.easeNone });
        TweenMax.set($('.mancha'), { zIndex: 11 });
      }
    }
    if ($(window).width() <= 1023) {
      $('#appButtonsMac').css('left', '39px');
    }
  }

  componentDidMount() {
    const self = this;
    $(document).ready(() => {
      if ($(window).width() <= 1023) {
            // $('.sidebar').css('left', '-224px');
            // $('.mainSubPanel').css('padding-left', '0px');
        self.props.setSidebarHidden(true);
        $('#appButtonsMac').css('left', '39px');
      }
      $('.sidebar-menu > li.have-children a.mainOption').on('click', function (i) {
        i.stopPropagation();
        if (!$(this).parent().hasClass('active')) {
          $('.sidebar-menu li ul').slideUp();
          $(this).next().slideToggle();
          $('.sidebar-menu li').removeClass('active');
          $(this).parent().addClass('active');
          // $($($(this).parent().siblings().children()[0]).children()[0]).css("transform", "rotate(135deg)");
          $($(this).children()[0]).css('transform', 'rotate(315deg)');
        } else {
          $(this).next().slideToggle();
          $('.sidebar-menu li').removeClass('active');
          $($(this).children()[0]).css('transform', 'rotate(135deg)');
        }
      });
      $('.miniButton').on('click', () => {
        const offset = $('.sidebar').offset().left;
        if (offset < 0 && !self.checkPopupActive()) {
          $('.sidebar').removeClass('hide');
          // TweenMax.set($('.mancha'), { zIndex:3});
          // TweenMax.set($('.mancha'), {css: {display: "block"}})
          // TweenMax.fromTo($('.mancha'), 0.3, {autoAlpha:0}, { autoAlpha:1, ease: Linear.easeNone});
        } else if (!self.checkPopupActive()) {
          $('.sidebar').addClass('hide');
          $('.mainSubPanel').css('padding-left', '0px');
          // TweenMax.to($('.mancha'), 0.3, { autoAlpha:0, ease: Linear.easeNone});
          // TweenMax.set($('.mancha'), { zIndex:8, delay: 0.3});
        }
      });
    });
    this.subscribeToEvent();
  }

  subscribeToEvent() {
    const self = this;
    $(window).on('click', (e) => {
      if ($(e.target).is('.sidebar') || $(e.target).is('#sidebarLogo') || $(e.target).is('.userimage')) {
        return;
      }
      const offset = $('.sidebar').offset().left;
      if ($(window).width() <= 1023 && offset == 0) {
        $('.sidebar').addClass('hide');
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    $(window).off('click');
  }

  toggleHover(e) {
    this.props.hoveredSideBar(e.currentTarget.dataset.id);
  }

  toggleUnhover(e) {
    this.props.unhoveredSideBar(e.currentTarget.dataset.id);
  }

  handleClicked(e) {
    const page = e.currentTarget.dataset.id;
    const parent = e.currentTarget.dataset.parent;
    if (page == 'wallet') return;
    if (this.props.settings) { this.props.setSettings(false); }
    this.props.selectedSideBar(this.getParent(page), page);
    this.props.setSelectedPanel(page);
    if ($(window).width() <= 1023) {
      $('.sidebar').addClass('hide');
      $('.mainSubPanel').css('padding-left', '0px');
      TweenMax.to($('.mancha'), 0.3, { autoAlpha: 0, ease: Linear.easeNone });
    }
  }

  getParent(page) {
    if (page == 'overview' || page == 'send' || page == 'addresses' || page == 'transactions') {
      return 'wallet';
    } else if (page == 'contacts') {
      return undefined;
    }
  }

  render() {
    const progressBar = this.props.paymentChainSync;

    let walletStyle = '';
    let overviewStyle = '';
    let sendStyle = '';
    let addressesStyle = '';
    let transactionsStyle = '';
    let fileStorageStyle = '';
    let messagingStyle = '';
    let contactsStyle = '';
    let wallet = Tools.getIconForTheme('wallet', false);
    let addresses = Tools.getIconForTheme('addresses', false);
    let fileStorage = Tools.getIconForTheme('fileStorage', false);

    if (this.props.walletHovered || this.props.walletSelected) {
      wallet = Tools.getIconForTheme('wallet', true);
      walletStyle = ' sidebarItemSelected';
    }
    if (this.props.overviewHovered || this.props.overviewSelected) {
      overviewStyle = ' sidebarItemSelected';
    }
    if (this.props.sendHovered || this.props.sendSelected) {
      sendStyle = ' sidebarItemSelected';
    }
    if (this.props.addressesHovered || this.props.addressesSelected) {
      addresses = Tools.getIconForTheme('addresses', true);
      addressesStyle = ' sidebarItemSelected';
    }
    if (this.props.transactionsHovered || this.props.transactionsSelected) {
      transactionsStyle = ' sidebarItemSelected';
    }
    if (this.props.fileStorageHovered || this.props.fileStorageSelected) {
      fileStorage = Tools.getIconForTheme('fileStorage', true);
      fileStorageStyle = ' sidebarItemSelected';
    }
    if (this.props.messagingHovered || this.props.messagingSelected) {
      messagingStyle = ' sidebarItemSelected';
    }
    if (this.props.contactsHovered || this.props.contactsSelected) {
      contactsStyle = ' sidebarItemSelected';
    }

    const usericon = require('../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="userimage">
          <img id="sidebarLogo" src={usericon} />
        </div>
        <ul className="sidebar-menu">
          <li className="have-children"><a data-id="wallet" className={`mainOption${walletStyle}`}><div className="arrowMenu" /><img style={{ position: 'relative', top: '-2px' }} src={wallet} /><span />{ this.props.lang.wallet }</a>
            <ul>
              <li><Link to="/" className={overviewStyle} onClick={this.handleClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="overview">
                <CurrencyUsdIcon size={20} className="sidebarImage" />
                { this.props.lang.overview }
              </Link></li>
              <li><Link to="/send" className={sendStyle} data-id="send">
                <SendIcon size={20} className="sidebarImage" />
                { this.props.lang.send }
              </Link></li>
              <li><img className="sidebarImage" src={addresses} /> <Link to="/addresses" className={addressesStyle} data-id="addresses"><img className="sidebarImage" src={addresses} />{ this.props.lang.addresses }</Link></li>
              <li><Link to="/transactions" className={transactionsStyle} data-id="transactions">
                <FormatListBulletedIcon size={20} className="sidebarImage" />
                { this.props.lang.transactions }
              </Link></li>
            </ul>
          </li>
          {/* <li className="have-children"><a onClick={this.handleClicked} href="#" onMouseEnter={this.toggleHover} onMouseLeave={this.toggleUnhover} data-id="fileStorage" className={"mainOption" + fileStorageStyle}><div className="arrowMenu"></div><img src={fileStorage}/><span></span>{ this.props.lang.fileStorage }</a>
            <ul>
              <li><a href="#">{ this.props.lang.customer }</a></li>
              <li><a href="#">{ this.props.lang.viewFiles }</a></li>
              <li><a href="#">{ this.props.lang.gallery }</a></li>
              <li><a href="#">{ this.props.lang.provider }</a></li>
            </ul>
          </li> */}
          <li><Link to="/files" data-id="fileStorage" className={`mainOption${fileStorageStyle}`}><img style={{ position: 'relative', top: '-2px' }} src={fileStorage} /><span />{ this.props.lang.fileStorage }</Link></li>
          <li><Link to="/messages" data-id="messaging" className={`mainOption${messagingStyle}`}>
            <ForumIcon size={20} style={{ position: 'relative', top: '-1px', marginRight: '20px' }} />
            { this.props.lang.messaging }
          </Link></li>
          <li><Link to="/contacts" data-id="contacts">
            <ContactsIcon size={20} style={{ marginRight: '20px', position: 'relative', top: '-2px' }} />
            { this.props.lang.contacts }
          </Link></li>
        </ul>
        <div className="connections sidebar-section-container">
          <a data-tip="View network stats" onClick={this.handleClicked} data-id="network" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <p style={{ fontSize: '13px' }}>{`${this.props.lang.syncing} ${progressBar}%`}</p>
            <div className="progress">
              <div className="bar" style={{ width: `${progressBar}%` }} />
            </div>
            <p style={{ fontSize: '13px' }}>{`${this.props.lang.activeConnections}: ${this.props.connections}`}</p>
          </a>
        </div>
        <ReactTooltip />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
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
