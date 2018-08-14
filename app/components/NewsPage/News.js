import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";
const event = require('../../utils/eventhandler');
import * as actions from '../../actions';
import NewsItem from './NewsItem';
import { ipcRenderer } from 'electron';
import $ from 'jquery';

class News extends Component {
  constructor(props) {
    super(props);
    this.updateContainer = this.updateContainer.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
  }

  componentDidMount() {
    $( window ).on('resize', () => {
      this.updateContainer(true);
    });
    this.updateContainer(false);
    this.props.setNewsChecked(new Date().getTime());
  }

  handleDropDownClicked(){
    $('.dropdownFilterSelector').attr('tabindex', 1).focus();
    $('.dropdownFilterSelector').toggleClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideToggle(300);
  }

  handleDrowDownUnfocus(){
    $('.dropdownFilterSelector').removeClass('active');
    $('.dropdownFilterSelector').find('.dropdown-menuFilterSelector').slideUp(300);
  }

  updateContainer(forceRefresh){
    let containerSize = $(window).height() - 300;
    $('.postsContainer').css('height', containerSize);
    let postsPerContainer = Math.floor(containerSize / 155);
    var currentPostsPerContainer = this.props.postsPerContainer;
    if(currentPostsPerContainer !== postsPerContainer){
      this.props.setEccPostsPage(1);
    }
    this.props.setPostsPerContainer(postsPerContainer);
    if(forceRefresh){
      setTimeout(()=>{
        this.updateContainer(false);
      }, 200)
    }
  }

  componentWillUnmount() {
    $( window ).off('resize');
    this.props.setShowingNews(false);
  }

  getSpliceValue(){
    let width = $('.panel').width()-80;
    return Math.floor(width/4.1);
  }

  updateArrows(page){
    let items = $('#postsContainer' + page).children().length;
    TweenMax.to('#arrows', 0.3, {css:{top: items >= this.props.postsPerContainer ? (155 * this.props.postsPerContainer + 180) : (155 * items + 180)}})
  }

  switchPage(direction){
    if(this.props.switchingPage) return;
    if(direction === "right" && !$('#arrowRight').hasClass('arrowInactive')){
      this.props.setNewsSwitchingPage(true);
      TweenMax.to('#postsContainer' + (this.props.eccPostsPage-1), 0.5, {x: -1500, autoAlpha: 0});
      TweenMax.fromTo('#postsContainer' + (this.props.eccPostsPage), 0.5, {x: 1500, autoAlpha: 0}, {x: 0, autoAlpha: 1});
      setTimeout(() => {
        this.props.setEccPostsPage(this.props.eccPostsPage + 1);
        this.props.setNewsSwitchingPage(false);
      }, 400);
      this.updateArrows(this.props.eccPostsPage);
    }
    else if(direction === "left" && !$('#arrowLeft').hasClass('arrowInactive')){
      this.props.setNewsSwitchingPage(true);
      TweenMax.to('#postsContainer' + (this.props.eccPostsPage-1), 0.5, {x: 1500, autoAlpha: 0});
      TweenMax.fromTo('#postsContainer' + (this.props.eccPostsPage-2), 0.5, {x: -1500, autoAlpha: 0}, {x: 0, autoAlpha: 1});
      setTimeout(() => {
        this.props.setEccPostsPage(this.props.eccPostsPage - 1);
        this.props.setNewsSwitchingPage(false);
      }, 400);
      this.updateArrows(this.props.eccPostsPage-2);
    }
  }

  async onItemClick(ev) {
    const currency = ev.currentTarget.dataset.id;
    console.log(currency)
    ipcRenderer.send('selected-currency', currency);
  }

  getValue(val){
    switch(val){
      case "usd" : return this.props.lang.usd;
      case "eur" : return this.props.lang.eur;
      case "aud" : return this.props.lang.aud;
      case "btc": return this.props.lang.btc;
      case "eth" : return this.props.lang.eth;
      case "ltc":return this.props.lang.ltc;
      case "bch": return this.props.lang.bch;
      case "gbp": return this.props.lang.gbp;
    }
  }

  /*shouldComponentUpdate(props){
    if(props.eccPostsPage < 1 || props.eccPostsPage * props.postsPerContainer > Object.keys(props.eccPosts).length) return false;
    return true;
  }*/

  render() {
    let items = 0;
    let selectedCurrency = this.props.selectedCurrency.toUpperCase()
    return (
      <div className="panel">
        <div className="row">
          <div className="col-md-6">
            <p id="eccNews">{this.props.lang.eccNews}</p>
          </div>
          <div className="col-md-6">
            {
              <div className="dropdownFilterSelector" style={{/*width: "100px", marginLeft: "100px", top: "6px",*/ height:"35px", padding:"0 0", textAlign:"center", top: '50px', left: '250px'}} onBlur={this.handleDrowDownUnfocus} onClick={this.handleDropDownClicked}>
                <div className="selectFilterSelector" style={{border: "none", position:"relative", top: "-1px", height: "30px"}}>
                  <p className="normalWeight">{this.getValue(this.props.selectedCurrency)}</p>
                  <i className="fa fa-chevron-down"></i>
                </div>
                <input type="hidden" name="gender"></input>
                <ul className="dropdown-menuFilterSelector normalWeight " style={{margin: "0 0"}}>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="usd">{ this.props.lang.usd }</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="gbp">{ this.props.lang.gbp }</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="eur">{ this.props.lang.eur }</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="aud">{ this.props.lang.aud }</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="btc">{ this.props.lang.btc }</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="eth">{ this.props.lang.eth }</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="ltc">{ this.props.lang.ltc }</li>
                  <li style={{padding: "5px"}} onClick={this.onItemClick} data-id="bch">{ this.props.lang.bch }</li>
                </ul>
              </div>
            }
          </div>
        </div>


        <div id="panelHolder">
        {this.props.eccPostsArrays.map((array, indexArray) => {
          return(
            <div className="postsContainer" id={"postsContainer" + indexArray} style={{opacity: indexArray === (this.props.eccPostsPage - 1) ? "1" : "0",
              visibility: indexArray === (this.props.eccPostsPage - 1) ? "visible" : "hidden", transform: indexArray === (this.props.eccPostsPage - 1) ? "initial" : ""}}
                 key={`newsPostContainer_${indexArray}`}>
            {array.map((post, index) => {
              if(indexArray === (this.props.eccPostsPage - 1))
                items++;
              return(
                <NewsItem
                  title = {post.title}
                  body = {post.body.slice(0, this.getSpliceValue()) + " ..."}
                  time = {post.timeSince}
                  date = {post.date}
                  key = {`newsPost_${post.url}`}
                  hasVideo = {post.hasVideo}
                  url = {post.url}>
                </NewsItem>
              )
            })
            }
            </div>
          )
          })
        }
        </div>
        <div id="arrows" style={{ top: items >= this.props.postsPerContainer ? (155 * this.props.postsPerContainer + 180) + "px" : (155 * items + 180) + "px" }}>
          <div onClick={this.switchPage.bind(this, "left")} className= {this.props.eccPostsPage - 1 == 0 ? "increaseClickArea increaseClickAreaLeft cursorPointerFalse" : "increaseClickArea increaseClickAreaLeft"}>
            <div id="arrowLeft" className={this.props.eccPostsPage - 1 === 0 ? "arrowNews arrowInactive arrowLeftNews" : "arrowNews arrowLeftNews"}></div>
          </div>
          <div onClick={this.switchPage.bind(this, "right")} className= {this.props.eccPostsPage * this.props.postsPerContainer < Object.keys(this.props.eccPosts).length ? "increaseClickArea" : "increaseClickArea cursorPointerFalse"}>
            <div id="arrowRight" className={this.props.eccPostsPage * this.props.postsPerContainer < Object.keys(this.props.eccPosts).length ? "arrowNews arrowRightNews" : "arrowNews arrowInactive arrowRightNews"}></div>
          </div>
        </div>
        <div id="stats">
          <div style={{textAlign: 'center', margin: 'auto'}} className="row">
            <p id="marketStats" style={{margin: 'auto'}}>Market Stats</p>
          </div>
          <div className="row">
            <div className="statsItem" id="rank">
              <p>{ this.props.lang.rank }</p>
              <p>{this.props.cmcStats.rank}</p>
              <div className="mask"></div>
            </div>
            <div className="statsItem" id="marketCap">
              <p>{ this.props.lang.marketCap }</p>
              <p>{this.props.cmcStats.marketCap + ' ' + selectedCurrency}</p>
              <div className="mask"></div>
            </div>
            <div className="statsItem" id="price">
              <p>{ this.props.lang.price }</p>
              <p>{this.props.cmcStats.price + ' ' + selectedCurrency }</p>
              <div className="mask"></div>
            </div>
            <div className="statsItem" id="volume">
              <p>{ this.props.lang.volume }</p>
              <p>{ this.props.cmcStats.volume + ' ' + selectedCurrency }</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    eccPostsArrays: state.application.eccPostsArrays,
    postsPerContainer: state.application.postsPerContainerEccNews,
    eccPostsPage: state.application.eccPostsPage,
    eccPosts: state.application.eccPosts,
    cmcStats: state.application.coinMarketCapStats,
    switchingPage: state.application.eccNewsSwitchingPage,
    selectedCurrency: state.application.selectedCurrency
  };
};

export default connect(mapStateToProps, actions)(News);
