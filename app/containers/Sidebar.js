import React, { Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import { NavLink } from 'react-router-dom';
import * as actions from '../actions';
import ReactTooltip from 'react-tooltip';
import { CurrencyUsdIcon, SendIcon, FormatListBulletedIcon, ContactsIcon, ForumIcon, SettingsOutlineIcon, NewspaperIcon } from 'mdi-react';

const homedir = require('os').homedir();
const Tools = require('../utils/tools');

class Sidebar extends Component {
  constructor(props) {
    super(props);
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
      $('#appButtonsMac').css('left', '20px');
      if (!this.checkPopupActive()) {
        TweenMax.to($('.mancha'), 0.3, { autoAlpha: 0, ease: Linear.easeNone });
        TweenMax.set($('.mancha'), { zIndex: 11 });
      }
    } else if ($(window).width() <= 1023) {
      $('.sidebar').addClass('hide');
      $('.mainSubPanel').css('padding-left', '0px');
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

  render() {
    const progressBar = this.props.paymentChainSync;

    let addresses = Tools.getIconForTheme('addresses', false);
    let fileStorage = Tools.getIconForTheme('fileStorage', false);

    const usericon = require('../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="d-flex flex-column justify-content-between" style={{minHeight: '100%'}}>
          <div>
            <div className="userimage">
              <img id="sidebarLogo" src={usericon} />
            </div>
            <div className="menu">
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.wallet }</a>
                </li>
                <li>
                  <NavLink to="/" exact activeClassName="active">
                    <CurrencyUsdIcon size={20} />
                    { this.props.lang.overview }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/send" activeClassName="active">
                    <SendIcon size={20} />
                    { this.props.lang.send }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/addresses" activeClassName="active">
                    <img src={addresses} />
                    { this.props.lang.addresses }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/transactions" activeClassName="active">
                    <FormatListBulletedIcon size={20} />
                    { this.props.lang.transactions }
                  </NavLink>
                </li>
              </ul>
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.services }</a>
                </li>
                <li>
                  <NavLink to="/files">
                    <img src={fileStorage} />
                    { this.props.lang.fileStorage }
                    </NavLink>
                </li>
                <li>
                  <NavLink to="/messages">
                    <ForumIcon size={20} />
                    { this.props.lang.messaging }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contacts">
                    <ContactsIcon size={20} />
                    { this.props.lang.contacts }
                  </NavLink>
                </li>
              </ul>
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.default }</a>
                </li>
                <li>
                  <NavLink to="/news">
                    <NewspaperIcon size={20} />
                    { this.props.lang.eccNews }
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings">
                    <SettingsOutlineIcon size={20} />
                    { this.props.lang.settings }
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="connections sidebar-section-container">
            <NavLink to="/network" data-tip="View network stats" data-id="network">
              <p style={{ fontSize: '13px' }}>{`${this.props.lang.syncing} ${progressBar}%`}</p>
              <div className="progress">
                <div className="bar" style={{ width: `${progressBar}%` }} />
              </div>
              <p style={{ fontSize: '13px' }}>{`${this.props.lang.activeConnections}: ${this.props.connections}`}</p>
            </NavLink>
            <ReactTooltip />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
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

export default connect(mapStateToProps, actions, null, { pure: false })(Sidebar);
