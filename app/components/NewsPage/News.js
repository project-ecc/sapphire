import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import NewsItem from './NewsItem';
import $ from 'jquery';
import {TweenMax} from "gsap";

class News extends Component {
  constructor(props) {
    super(props);
    this.updateContainer = this.updateContainer.bind(this);
  }

  componentDidMount() {
    const self = this;
    $( window ).on('resize', function() {
      self.updateContainer();
    });
    this.updateContainer();
    this.props.setNewsChecked(new Date().getTime());
  }

  updateContainer(){
    let containerSize = $(window).height() - 300;
    $('.postsContainer').css('height', containerSize);
    let postsPerContainer = Math.floor(containerSize / 155);
    var currentPostsPerContainer = this.props.postsPerContainer;
    if(currentPostsPerContainer != postsPerContainer){
      this.props.setEccPostsPage(1);
    }
    this.props.setPostsPerContainer(postsPerContainer);
  }

  componentWillUnmount() {
    $( window ).off('resize');
    this.props.setShowingNews(false);
  }

  getSpliceValue(){
    let width = $('.panel').width()-80;
    return Math.floor(width/4);
  }

  updateArrows(page){
    let items = $('#postsContainer' + page).children().length;
    TweenMax.to('#arrows', 0.3, {css:{top: items >= this.props.postsPerContainer ? (155 * this.props.postsPerContainer + 180) : (155 * items + 180)}})
  }

  switchPage(direction){
    if(this.props.switchingPage) return;
    var self = this;
    if(direction == "right" && !$('#arrowRight').hasClass('arrowInactive')){
      this.props.setNewsSwitchingPage(true);
      TweenMax.to('#postsContainer' + (this.props.eccPostsPage-1), 0.5, {x: -1500, autoAlpha: 0});
      TweenMax.fromTo('#postsContainer' + (this.props.eccPostsPage), 0.5, {x: 1500, autoAlpha: 0}, {x: 0, autoAlpha: 1});
      setTimeout(() => {
        self.props.setEccPostsPage(this.props.eccPostsPage + 1);
        self.props.setNewsSwitchingPage(false);
      }, 500)
      this.updateArrows(this.props.eccPostsPage);
    }
    else if(direction == "left" && !$('#arrowLeft').hasClass('arrowInactive')){
      this.props.setNewsSwitchingPage(true);
      TweenMax.to('#postsContainer' + (this.props.eccPostsPage-1), 0.5, {x: 1500, autoAlpha: 0});
      TweenMax.fromTo('#postsContainer' + (this.props.eccPostsPage-2), 0.5, {x: -1500, autoAlpha: 0}, {x: 0, autoAlpha: 1});
      setTimeout(() => {
        self.props.setEccPostsPage(this.props.eccPostsPage - 1);
        self.props.setNewsSwitchingPage(false);
      }, 500)
      this.updateArrows(this.props.eccPostsPage-2);
    }
  }

  shouldComponentUpdate(props){
    if(props.eccPostsPage < 1 || props.eccPostsPage * props.postsPerContainer > Object.keys(props.eccPosts).length) return false;
    return true;
  }

  render() {
    var self = this;
    let items = 0;
    return (
      <div className="panel">
        <p id="eccNews">ECC News</p>
        <div id="panelHolder">
        {this.props.eccPostsArrays.map((array, indexArray) => {
          return(
            <div className="postsContainer" id={"postsContainer" + indexArray} style={{opacity: indexArray == (self.props.eccPostsPage - 1) ? "1" : "0", visibility: indexArray == (self.props.eccPostsPage - 1) ? "visible" : "hidden", transform: indexArray == (self.props.eccPostsPage - 1) ? "initial" : ""}} key={`newsPostContainer_${indexArray}`}>
            {array.map((post, index) => {
              if(indexArray == (self.props.eccPostsPage - 1))
                items++;
              return(
                <NewsItem
                  title = {post.title}
                  body = {post.body.slice(0, self.getSpliceValue()) + " ..."}
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
        <div id="arrows" style={{width: $('.panel').width()-80, top: items >= this.props.postsPerContainer ? (155 * this.props.postsPerContainer + 180) + "px" : (155 * items + 180) + "px" }}>
          <div id="arrowLeft" onClick={this.switchPage.bind(this, "left")} className={this.props.eccPostsPage - 1 == 0 ? "arrowNews arrowInactive arrowLeftNews" : "arrowNews arrowLeftNews"}></div>
          <div id="arrowRight" onClick={this.switchPage.bind(this, "right")} className= {this.props.eccPostsPage * this.props.postsPerContainer < Object.keys(this.props.eccPosts).length ? "arrowNews arrowRightNews" : "arrowNews arrowInactive arrowRightNews"}></div>
        </div>
        <div id="stats">
          <div className="statsItem" id="rank">
            <p>Rank</p>
            <p>{this.props.cmcStats.rank}</p>
            <div className="mask"></div>
          </div>
          <div className="statsItem" id="marketCap">
            <p>Market Cap</p>
            <p>{this.props.cmcStats.marketCap}</p>
            <div className="mask"></div>
          </div>
          <div className="statsItem" id="price">
            <p>Price</p>
            <p>{this.props.cmcStats.price}</p>
            <div className="mask"></div>
          </div>
          <div className="statsItem" id="volume">
            <p>Volume (24h)</p>
            <p>{this.props.cmcStats.volume}</p>
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
    switchingPage: state.application.eccNewsSwitchingPage
  };
};

export default connect(mapStateToProps, actions)(News);