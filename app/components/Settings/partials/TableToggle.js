import React, {Component} from 'react';
import ToggleButton from 'react-toggle';

class TableToggle extends Component {
  constructor(props) {
    super(props);
    this.getSubText = this.getSubText.bind(this);
  }

  getSubText(){
    if(this.props.subText){
      return(
        <div>
          {this.props.subText}
        </div>
      )
    }
    return null;
  }

  //the key element is required, otherwise we get a weird behavior (caused by react optimizations) switching between panels that have toggles, feel free to remove the key element and give it a go
  render() {
    return (
      <div key={this.props.keyVal}>
        <div >
          {this.props.text}
          {this.getSubText()}
        </div>
        <div >
        <ToggleButton checked={this.props.checked}  onChange={() => {this.props.handleChange(); }} />
        </div>
      </div>
    );
  }
}

export default TableToggle;
