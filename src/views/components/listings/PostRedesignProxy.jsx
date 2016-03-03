import React from 'react';

import constants from '../../../constants';

import BaseComponent from '../BaseComponent';
import Listing from '../Listing';
import Post from './Post';

const { LISTING_REDESIGN } = constants.flags;
const T = React.PropTypes;

export default class PostRedesignProxy extends BaseComponent {
  static propTypes = {
    feature: T.object.isRequired,
  };

  render() {
    // NOTE: using splats here because there are no splats in
    // pages/listing.jsx where this is intended to be used.
    if (this.props.feature.enabled(LISTING_REDESIGN)) {
      return (
        <Post
          { ...this.props }
          post={ this.props.listing }
        />
      );
    }

    return (<Listing { ...this.props } />);
  }
}
