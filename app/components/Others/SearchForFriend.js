import Autosuggest from 'react-autosuggest';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import db from '../../utils/database/db'

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

const Peer = db.Peer;



// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.display_name;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div style={{alignItems: 'flex-start'}} className="MuiListItem-root MuiListItem-gutters MuiListItem-alignItemsFlexStart">
      <ListItemAvatar>
        <Avatar alt="Peer display image" src={suggestion.display_image} />
      </ListItemAvatar>
      <ListItemText
        primary={suggestion.display_name}
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              style={{display: 'inline'}}
              color="textPrimary"
            >
              {suggestion.id}
            </Typography>
          </React.Fragment>
        }
      />
  </div>
);

class SearchForFriend extends Component {
  constructor() {
    super();

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    this.state = {
      value: '',
      suggestions: [],
      peers: []
    };
  }

  async componentDidMount(){
    let peers = await Peer.findAll()
    this.setState({
      peers: peers
    })
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
    this.props.selectedPeer(newValue)
  };

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.state.peers.filter(lang =>
      lang.display_name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };
  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search for a Peer',
      value,
      onChange: this.onChange
    };

    // Finally, render it!
    return (
      <div>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(SearchForFriend);
