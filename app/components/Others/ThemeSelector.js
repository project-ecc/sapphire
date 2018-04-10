import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
const settings = require('electron-settings');

class ThemeSelector extends Component {
  constructor(props) {
    super(props);
  }

  onClickTheme(name){
    this.props.setTheme(name);
    this.props.setChangedTheme(true);
    settings.set('settings.display.theme', name);
    if(this.props.forceUpdate){
      this.props.forceUpdate();
    }
  }

  onHover(name){
    this.props.setThemeBackup(this.props.theme);
    this.props.setTheme(name);
    if(this.props.forceUpdate){
      this.props.forceUpdate();
    }
  }

  onUnhover(){
    if(!this.props.changedTheme){
      this.props.setTheme(this.props.backupTheme);
    }
    this.props.setChangedTheme(false);
    if(this.props.forceUpdate){
      this.props.forceUpdate();
    }
  }

  render() {
    return (
     <div id="themes" style={{position:"relative", marginTop:"30px", left:"-32px"}}>
      <div onMouseEnter={this.onHover.bind(this, "theme-darkEcc")} onMouseLeave={this.onUnhover.bind(this)} onClick={this.onClickTheme.bind(this, "theme-darkEcc")} className={this.props.theme == "theme-darkEcc" ? "themeSelector selectedTheme" : "themeSelector" } id="darkTheme">
       <div className="themes">
         <div className="theme">
          <div className="divSquare" style={{backgroundColor: "#d09128"}}></div>
          <div className="divSquare" style={{backgroundColor: "#21242a"}}></div>
          <div className="divSquare" style={{backgroundColor: "#333840"}}></div>
          <div className="divSquare" style={{backgroundColor: "#1e2544"}}></div>
         </div> 
       </div>
         <p className="themeName">{ this.props.lang.dark }</p>
       </div>
       <div onMouseEnter={this.onHover.bind(this, "theme-defaultEcc")} onMouseLeave={this.onUnhover.bind(this)} onClick={this.onClickTheme.bind(this, "theme-defaultEcc")} className={this.props.theme == "theme-defaultEcc" ? "themeSelector selectedTheme" : "themeSelector" } id="defaultTheme">
       <div className="themes">
         <div className="theme">
          <div className="divSquare" style={{backgroundColor: "#d09128"}}></div>
          <div className="divSquare" style={{backgroundColor: "#14182f"}}></div>
          <div className="divSquare" style={{backgroundColor: "#c4c4d3"}}></div>
          <div className="divSquare" style={{backgroundColor: "#1e2544"}}></div>
         </div> 
       </div>
         <p className="themeName">{ this.props.lang.default }</p>
       </div>
       <div style={{visibility: "hidden"}} className="themeSelector" id="lightTheme">
       <div className="themes">
         <div className="theme">
          <div className="divSquare" style={{backgroundColor: "#bbbbbb"}}></div>
          <div className="divSquare" style={{backgroundColor: "#17152a"}}></div>
          <div className="divSquare" style={{backgroundColor: "#de9b2b"}}></div>
          <div className="divSquare" style={{backgroundColor: "#ffffff"}}></div>
         </div> 
       </div>
         <p className="themeName">{ this.props.lang.light }</p>
       </div>
     </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    theme: state.application.theme,
    backupTheme: state.application.backupTheme,
    changedTheme: state.application.changedTheme
  };
};

export default connect(mapStateToProps, actions)(ThemeSelector);