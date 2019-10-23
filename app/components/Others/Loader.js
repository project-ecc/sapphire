import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactLoading from "react-loading";
import * as actions from '../../actions';

class Loader extends Component {
  render() {
    return (
      <div className="loader">
        <div className="loader-content" >
          <div className="loader-message" >
            <p >
              {this.props.loadingMessage}
            </p>
          </div>
          <ReactLoading type="spin" color="#ffc107" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    loadingMessage: state.startup.loadingMessage,
    loading: state.startup.loading
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(Loader);
