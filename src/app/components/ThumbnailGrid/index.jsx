import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import { thumbnailSelector } from 'app/selectors/thumbnail';

export const ThumbnailGrid = props => {
  const { thumbnails } = props;

  if (thumbnails) {
    return (
      <div className='ThumbnailGrid'>
        { thumbnails.map(tn =>
          <div className='ThumbnailGrid__thumbnailWrapper' key={ tn }>
            <div
                className='ThumbnailGrid__thumbnail'
                style={ { backgroundImage: `url(${tn})` } }
            />
          </div>
          ) }
      </div>
    );
  }

  return <div className='DualPartInterstitial__headerPlaceholder' />;
};

export default connect(thumbnailSelector)(ThumbnailGrid);
