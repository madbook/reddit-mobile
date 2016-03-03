import chai from 'chai';
import sinonChai from 'sinon-chai';
import {
  _WIDEST,
  _TALLEST,
  limitAspectRatio,
  aspectRatioClass,
  findPreviewImage,
} from '../../../../src/views/components/listings/mediaUtils';

import constants from '../../../../src/constants';
const { POST_COMPACT_THUMBNAIL_WIDTH } = constants;

chai.use(sinonChai);
const expect = chai.expect;

describe('mediaUtils: limitAspectRatio', () => {
  it('constrains aspect ratios between _WIDEST and _TALLEST', () => {
    expect(limitAspectRatio(_TALLEST - 0.1)).to.equal(_TALLEST);
    expect(limitAspectRatio(_WIDEST + 0.1)).to.equal(_WIDEST);
  });
});

describe('mediaUtils: aspectRatioClass', () => {
  it('reduces turns common aspect ratios to their lowest-common-denominator', () => {
    const ratios = [
      [16, 9],
      [5, 9],
      [4 , 3],
    ];

    ratios.forEach((ratio) => {
      const [x , y] = ratio;
      expect(aspectRatioClass(x / y)).to.equal(`aspect-ratio-${x}x${y}`);
    });
  });

  it('uses 16x9 as the default', () => {
    expect(aspectRatioClass()).to.equal(`aspect-ratio-16x9`);
  });
});

describe('mediaUtils: findPreviewImage', () => {
  it('uses the thumbnail when in compact and sizes it correctly', () => {
    const thumbnailUrl = 'foobar';
    const thumbanilPreview = findPreviewImage(true, {}, thumbnailUrl, {}, 100, false);
    expect(thumbanilPreview).to.have.property('url', thumbnailUrl);
    expect(thumbanilPreview).to.have.property('width', POST_COMPACT_THUMBNAIL_WIDTH);
    expect(thumbanilPreview).to.have.property('height', POST_COMPACT_THUMBNAIL_WIDTH);
  });

  it('when it needs nsfw blur, it uses them or returns nothing', () => {
    const thumbnailUrl = 'foobar';
    const size = 100;

    const previewImageOne = {
      variants: {
        nsfw: {
          source: 'fullsize blured',
          resolutions: [
            {
              width: size,
              height: size,
              url: 'small blurred',
            },
          ],
        },
      },
      source: 'blah',
      resolutions: [
        {
          width: size,
          height: size,
          url: 'the real source',
        },
      ],
    };

    const preview = {
      images: [ previewImageOne ],
    };

    const previewImage = findPreviewImage(false, preview, thumbnailUrl, {}, size, true);
    expect(previewImage).to.be.equal(previewImageOne.variants.nsfw.resolutions[0]);

    const nsfwOembed = {
      url: 'unblured nsfw oembed',
      width: size,
      height: size,
    };

    const nullOembed = findPreviewImage(false, undefined, thumbnailUrl, nsfwOembed, size, true);
    expect(nullOembed).to.be.empty;
  });

  it('uses the first image of the correct size, or as a last resort the source', () => {
    const increment = 150;

    function makeResolution(num) {
      return {
        url: `resoultion-${num}`,
        width: num * increment,
        height: num * increment,
      };
    }

    const resolutions = [1, 2, 3, 4, 5].map(makeResolution);
    const source = makeResolution(10);

    const preview = {
      images: [
        {
          source,
          resolutions,
        },
      ],
    };

    const previewImage = findPreviewImage(false, preview, '', {}, increment * 3, false);
    expect(previewImage).to.be.equal(resolutions[2]);

    const fullSizePreview = findPreviewImage(false, preview, '', {}, increment * 7, false);
    expect(fullSizePreview).to.be.equal(source);
  });

  it('uses the oembed when there is no preview info', () => {
    const size = 300;

    const oembed = {
      thumbnail_url: 'test url',
      thumbnail_width: size,
      thumbnail_height: size,
    };

    const result = {
      url: oembed.thumbnail_url,
      width: oembed.thumbnail_width,
      height: oembed.thumbnail_height,
    };

    const previewImage = findPreviewImage(false, undefined, '', oembed, false);
    expect(previewImage).to.deep.equal(result);
  });
});
