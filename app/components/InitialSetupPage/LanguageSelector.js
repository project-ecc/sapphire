import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TweenMax } from 'gsap';
import $ from 'jquery';

import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';

const settings = require('electron').remote.require('electron-settings');

class LanguageSelector extends Component {
  constructor() {
    super();
    this.onItemClick = this.onItemClick.bind(this);

    this.state = {
      langs: [
        ['bg', 'български (Bulgarian)'],
        ['zh_cn', '简体中文—中国 (Chinese - CN)'],
        ['zh_hk', '繁體中文-中華人民共和國香港特別行政區 (Chinese - HK)'],
        ['nl', 'Nederlands (Dutch)'],
        ['en', 'English'],
        ['fr', 'Français (French)'],
        ['de', 'Deutsch (German)'],
        ['el', 'ελληνικά (Greek)'],
        ['ko', '한국어(Korean)'],
        ['pl', 'Polski (Polish)'],
        ['pt', 'Português (Portuguese)'],
        ['ru', 'Русский язык (Russian)'],
        ['sl', 'Slovenčina (Slovenian)'],
        ['es', 'Español (Spanish)'],
        ['tr', 'Türkçe (Turkish)'],
        ['vn', 'Tiếng việt (Vietnamese)']
      ]
    };
  }

  handleDropDownClicked() {
    $('.dropdownLanguageSelector').attr('tabindex', 1).focus();
    $('.dropdownLanguageSelector').toggleClass('active');
    $('.dropdownLanguageSelector').find('.dropdown-menuLanguageSelector').slideToggle(300);
  }

  handleDrowDownUnfocus() {
    $('.dropdownLanguageSelector').removeClass('active');
    $('.dropdownLanguageSelector').find('.dropdown-menuLanguageSelector').slideUp(300);
  }

  onItemClick(event) {
    const lang = event.currentTarget.dataset.id;
    settings.set('settings.lang', lang);
    this.props.setLang();
  }

  render() {
    return (
      <div>
        <div className="contentLanguageSelector">
          <p className="selectLanguageLanguageSelector" style={{ fontWeight: '300' }}>
            {this.props.lang.selectLanguage}
          </p>
          <div className="dropdownLanguageSelector" onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
            <div className="selectLanguageSelector">
              <p style={{ fontWeight: 'normal' }}>{language()}</p>
              <i className="fa fa-chevron-down" />
            </div>
            <input type="hidden" name="gender" />
            <ul style={{ fontWeight: 'normal' }} className="dropdown-menuLanguageSelector">
              {this.state.langs.map(lang => {
                return (<li key={lang[0]} onClick={this.onItemClick} data-id={lang[0]}>{lang[1]}</li>);
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions)(LanguageSelector);
