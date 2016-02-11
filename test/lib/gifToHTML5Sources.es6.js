import chai from 'chai';
import sinonChai from 'sinon-chai';
import gifToHTML5Sources from '../../src/lib/gifToHTML5Sources';
import { posterForHrefIfGiphyCat } from '../../src/lib/gifToHTML5Sources';

chai.use(sinonChai);
const expect = chai.expect;

describe('lib: gifToHTML5Sources', () => {
  it('is a function', () => {
    expect(gifToHTML5Sources).to.be.a('function');
  });

  it('returns undefined on blank urls and formats we don\'t know about', () => {
    expect(gifToHTML5Sources('app://fake.gif')).to.be.undefined;
    expect(gifToHTML5Sources('')).to.be.undefined;
    expect(gifToHTML5Sources('http://imgur.com/something-not-gif.png')).to.be.undefined;
  });

  it('doesn\'t match against domains that look like the real one we expect', () => {
    expect(gifToHTML5Sources('https://badgiphy.com/asdflkjasdfl.gif')).to.be.undefined;
    expect(gifToHTML5Sources('https://giant.longgfycat.com/SuperCoolAnimalName')).to.be.undefined;
    expect(gifToHTML5Sources('http://gifimgur.com/lkj2354lj2345.gif')).to.be.undefined;
  });

  it('turns gfycat links into mp4, wemb, and poster links', () => {
    const gfyCatGif = 'http://gfycat.com/ThankfulLimpingCrownofthornsstarfish';
    const gfyCatSources = gifToHTML5Sources(gfyCatGif);
    expect(gfyCatSources).to.exist.and.include.keys(['webm', 'mp4', 'poster']);
    expect(gfyCatSources.mp4).to.match(/mobile\.mp4$/);
    expect(gfyCatSources.webm).to.match(/\.webm$/);
    expect(gfyCatSources.poster).to.match(/mobile\.jpg$/);
  });

  it('turns imgur gifv links into mp4, webm, and poster links', () => {
    const imgurGif = 'http://i.imgur.com/ZohCJH8.gifv';
    const imgurSources = gifToHTML5Sources(imgurGif);
    expect(imgurSources).to.exist.and.include.keys(['webm', 'mp4', 'poster']);
    expect(imgurSources.poster).to.match(/h\.jpg$/);
    expect(imgurSources.webm).to.match(/\.webm$/);
    expect(imgurSources.mp4).to.match(/\.mp4$/);
  });

  it('turns giphy links into mp4', () => {
    const giphyGif = 'http://i.giphy.com/l4Ki2xDVdr2YD1Hqw.gif';
    const giphySources = gifToHTML5Sources(giphyGif);
    expect(giphySources).to.exist.and.to.include.keys(['mp4']);
    expect(giphySources.mp4).to.match(/\.mp4$/);
  });
});

describe('lib: posterForHrefIfGiphyCat', () => {
  it('is a function', () => {
    expect(posterForHrefIfGiphyCat).to.be.a('function');
  });

  it('turns gfcycat gifs into jpg link', () => {
    const gfyCatGif = 'http://gfycat.com/ThankfulLimpingCrownofthornsstarfish';
    expect(posterForHrefIfGiphyCat(gfyCatGif)).to.exist.and.match(/mobile\.jpg$/);
  });

  it('doesn\'t turn other gifs into jpg links', () => {
    expect(posterForHrefIfGiphyCat('https://imgur.com/somegif.gif')).to.be.undefined;
    expect(posterForHrefIfGiphyCat('https://giphy.com/asdfasdf.gif')).to.be.undefined;
  });
});
