import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as actions from '../../actions';
import {language} from '../../lang/lang';

import $ from 'jquery';

const settings = require('electron').remote.require('electron-settings');


class LanguangeSelector extends Component {
  constructor(props) {
    super(props);
    this.onItemClick = this.onItemClick.bind(this);
  }

  handleDropDownClicked(){
    $('.dropdownLanguageSelector').attr('tabindex', 1).focus();
    $('.dropdownLanguageSelector').toggleClass('active');
    $('.dropdownLanguageSelector').find('.dropdown-menuLanguageSelector').slideToggle(300);
  }

  handleDrowDownUnfocus(){
    $('.dropdownLanguageSelector').removeClass('active');
    $('.dropdownLanguageSelector').find('.dropdown-menuLanguageSelector').slideUp(300);
  }


  onItemClick(event) {
    let lang = event.currentTarget.dataset.id;
    settings.set('settings.lang', lang);
    this.props.setLang();
  }

  render() {
    return (
      <div className="dropdownLanguageSelector" onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
        <div className="selectLanguageSelector">
          <p style={{fontWeight:"normal"}}>{language()}</p>
          {/*<i className="fa fa-chevron-down"></i>*/}
        </div>
        <input type="hidden" name="language"></input>
        {/*
        <ul style={{fontWeight:"normal"}} className="dropdown-menuLanguageSelector">
            <li onClick={this.onItemClick} data-id="bg">български (Bulgarian)</li>
            <li onClick={this.onItemClick} data-id="zh_cn">简体中文—中国 (Chinese - CN)</li>
            <li onClick={this.onItemClick} data-id="zh_hk">繁體中文-中華人民共和國香港特別行政區 (Chinese - HK)</li>
            <li onClick={this.onItemClick} data-id="nl">Nederlands (Dutch)</li>
            <li onClick={this.onItemClick} data-id="en">English</li>
            <li onClick={this.onItemClick} data-id="fr">Français (French)</li>
            <li onClick={this.onItemClick} data-id="de">Deutsch (German)</li>
            <li onClick={this.onItemClick} data-id="el">ελληνικά (Greek)</li>
            <li onClick={this.onItemClick} data-id="ko">한국어(Korean)</li>
            <li onClick={this.onItemClick} data-id="pl">Polski (Polish)</li>
            <li onClick={this.onItemClick} data-id="pt">Português (Portuguese)</li>
            <li onClick={this.onItemClick} data-id="ru">Русский язык (Russian)</li>
            <li onClick={this.onItemClick} data-id="sl">Slovenčina (Slovenian)</li>
            <li onClick={this.onItemClick} data-id="es">Español (Spanish)</li>
            <li onClick={this.onItemClick} data-id="tr">Türkçe (Turkish)</li>
            <li onClick={this.onItemClick} data-id="vn">Tiếng việt (Vietnamese)</li>
        </ul>*/}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions)(LanguangeSelector);
