import React from 'react';

import BaseComponent from './BaseComponent';

class ListingPaginationButtons extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      compact: this.props.compact
    };
  }

  render() {
    const compact = this.state.compact;
    const { prevUrl, nextUrl } = this.props;
    let prevButton;
    let nextButton;

    if (prevUrl) {
      prevButton = (
        <a href={ prevUrl } rel='prev' className='btn btn-sm btn-primary IndexPage-button prev'>
          <span className='glyphicon glyphicon-chevron-left'></span>
            Previous Page
        </a>
      );
    }

    if (nextUrl) {
      nextButton = (
        <a href={ nextUrl } rel='next' className='btn btn-sm btn-primary IndexPage-button next'>
          Next Page
          <span className='glyphicon glyphicon-chevron-right'></span>
        </a>
      );
    }

    return (
      <div className='pageNav IndexPage-buttons-holder-holder'>
        <div className='col-xs-12 IndexPage-buttons-holder'>
           <p className={'IndexPage-buttons' + (compact ? ' compact' : '')}>
              { prevButton } { nextButton }
            </p>
        </div>
      </div>
    );
  }

  static propTypes = {
    compact: React.PropTypes.bool,
    prevUrl: React.PropTypes.string,
    nextUrl: React.PropTypes.string,
  }
}

export default ListingPaginationButtons;