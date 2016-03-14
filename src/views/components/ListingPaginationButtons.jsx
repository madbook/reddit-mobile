import React from 'react';
import querystring from 'querystring';

import BaseComponent from './BaseComponent';

const T = React.PropTypes;

class ListingPaginationButtons extends BaseComponent {
  static propTypes = {
    listings: T.array.isRequired,
    compact: T.bool,
    prevUrl: T.string,
    nextUrl: T.string,
    pageSize: T.number,
    preventUrlCreation: T.bool,
  };

  static defaultProps = {
    pageSize: 25,
    preventUrlCreation: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      compact: this.props.compact,
    };
  }

  buildPrevUrl () {
    const {
      pagingPrefix = '',
      listings,
      ctx,
    } = this.props;

    const firstId = listings[0].name;
    const page = parseInt(ctx.query.page || 0);

    if (page > 0) {
      const prevQuery = {
        ...ctx.query,
        count: 25,
        page: page - 1,
        before: firstId,
        after: undefined,
      };

      return `${pagingPrefix}?${querystring.stringify(prevQuery)}`;
    }
  }

  buildNextUrl () {
    const props = this.props;
    const { listings, ctx, pagingPrefix } = props;
    const lastId = listings[listings.length - 1].name;
    const page = parseInt(ctx.query.page || 0);

    const nextQuery = {
      ...props.ctx.query,
      count: 25,
      page: page + 1,
      after: lastId,
      before: undefined,
    };

    return `${pagingPrefix || ''}?${querystring.stringify(nextQuery)}`;
  }

  render() {
    const compact = this.state.compact;

    // Allow overriding for special cases, like search. Otherwise, fall back to
    // the default logic for building next/previous urls.
    let {
      prevUrl,
      nextUrl,
    } = this.props;

    const {
      preventUrlCreation,
      listings,
      pageSize = 25,
    } = this.props;

    if (!prevUrl && !preventUrlCreation) {
      prevUrl = this.buildPrevUrl();
    }

    if (!nextUrl && !preventUrlCreation) {
      nextUrl = this.buildNextUrl();
    }


    let prevButton;
    let nextButton;

    if (prevUrl) {
      prevButton = (
        <a href={ prevUrl } rel='prev' className='IndexPage-button prev'>
          <span className='glyphicon glyphicon-chevron-left'></span>
          PREVIOUS
        </a>
      );
    }

    if (listings.length >= pageSize && nextUrl) {
      nextButton = (
        <a href={ nextUrl } rel='next' className='IndexPage-button next'>
          NEXT
          <span className='glyphicon glyphicon-chevron-right'></span>
        </a>
      );
    }

    return (
      <div className='IndexPage-buttons-holder-holder'>
        <div className='IndexPage-buttons-holder'>
           <p className={ `IndexPage-buttons${compact ? ' compact' : ''}` }>
              { prevButton } { nextButton }
            </p>
        </div>
      </div>
    );
  }
}

export default ListingPaginationButtons;
