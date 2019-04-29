import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as actions from '../../actions';

const settings = require('electron').remote.require('electron-settings');

class ThemeSelector extends Component {
  constructor(props) {
    super(props);
  }

  onClickTheme(name) {
    this.props.setTheme(name);
    this.props.setChangedTheme(true);
    settings.set('settings.display.theme', name);
  }

  onHover(name) {
    this.props.setThemeBackup(this.props.theme);
    this.props.setTheme(name);
  }

  onUnhover() {
    if (!this.props.changedTheme) {
      this.props.setTheme(this.props.backupTheme);
    }
    this.props.setChangedTheme(false);
  }

  render() {
    return (
      <div id="themes">
        <div
          onMouseEnter={this.onHover.bind(this, 'theme-defaultEcc')}
          onMouseLeave={this.onUnhover.bind(this)}
          onClick={this.onClickTheme.bind(this, 'theme-defaultEcc')}
          className={`themeSelector ${this.props.theme === 'theme-defaultEcc' ? 'selectedTheme' : ''}`}
        >
          <div className="output">
            <div style={{ backgroundColor: '#d09128' }} />
            <div style={{ backgroundColor: 'rgb(28, 35, 64)' }} />
          </div>
          <p>{ this.props.lang.default }</p>
        </div>

        <div
          onMouseEnter={this.onHover.bind(this, 'theme-darkEcc')}
          onMouseLeave={this.onUnhover.bind(this)}
          onClick={this.onClickTheme.bind(this, 'theme-darkEcc')}
          className={`themeSelector ${this.props.theme === 'theme-darkEcc' ? 'selectedTheme' : ''}`}
        >
          <div className="output">
            <div style={{ backgroundColor: '#d09128' }} />
            <div style={{ backgroundColor: '#333840' }} />
          </div>
          <p>{ this.props.lang.dark }</p>
        </div>

        <div
          onMouseEnter={this.onHover.bind(this, 'theme-lightEcc')}
          onMouseLeave={this.onUnhover.bind(this)}
          onClick={this.onClickTheme.bind(this, 'theme-lightEcc')}
          className={`themeSelector ${this.props.theme === 'theme-lightEcc' ? 'selectedTheme' : ''}`}
        >
          <div className="output">
            <div style={{ backgroundColor: '#de9b2b' }} />
            <div style={{ backgroundColor: '#ffffff' }} />
          </div>
          <p>{ this.props.lang.light }</p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    theme: state.application.theme,
    backupTheme: state.application.backupTheme,
    changedTheme: state.application.changedTheme
  };
};

export default connect(mapStateToProps, actions)(ThemeSelector);
