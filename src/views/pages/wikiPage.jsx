import React from 'react';
import process from 'reddit-text-js';
import moment from 'moment';

import mobilify from '../../lib/mobilify';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import ListingContainer from '../components/ListingContainer';
import TextSubNav from '../components/TextSubNav';

const PAGETYPES = {
  LISTING: 't3',
  WIKIPAGE: 'WikiPage',
  WIKI_REVISION: 'WikiRevision',
  WIKIPAGE_LISTING: 'WikiPageListing',
  WIKIPAGE_SETTINGS: 'WikiPageSettings',
};

class WikiPageComp extends BasePage {
  static propTypes = {
    subredditName: React.PropTypes.string,
    ctx: React.PropTypes.object.isRequired,
  };
  
  makeContent(props, data) {
    const compact = props.compact;
    let content;

    switch (data.wikiPage._type) {
      case PAGETYPES.LISTING:
        content = (
          <ListingContainer
            {...props}
            compact={ compact }
            user={ data.user || null }
            showAds={ false }
            listings={ data.wikiPage.conversations }
          />
        );
        break;
      case PAGETYPES.WIKI_REVISION:
        const revisions = data.wikiPage.revisions.map((wikiRevision)=> {
          const { author, page, timestamp } = wikiRevision;
          return (
            <div>
              { author.name } { page } { moment(timestamp * 1000).fromNow() }
            </div>
          );
        });

        content = (
          <div className='wikiPage-container'>
            <h2>Revisions</h2>
            { revisions }
          </div>
        );
        break;
      case PAGETYPES.WIKIPAGE_LISTING:
        const list = data.wikiPage.pages.map((link, i) => {
          return (
            <li key={ i }>
              <a href={ link }>{ link }</a>
            </li>
          );
        });

        content = (
          <div className='wikiPage-container'>
            <ul className='list-unstyled'>
              { list }
            </ul>
          </div>
        );

        break;
      case PAGETYPES.WIKIPAGE:
        const body = data.wikiPage.content_md || 'Nothing here...';

        content = (
          <div className='wikiPage-container'>
            <div
              className='wikiPage-html'
              dangerouslySetInnerHTML={ { __html: process(mobilify(body)) } }
            />
          </div>
        );
        break;
      case PAGETYPES.WIKIPAGE_SETTINGS:
        const { pageEditorsList, editingPermissionLevel, listedInPagesIndex } = data.wikiPage;
        const editors = pageEditorsList.map((editor, i) => {
          return (
            <li key= { i } >{ editor.name }</li>
          );
        });

        content = (
          <div className='wikiPage-container'>
            <div>
              <p>editing permissions: { editingPermissionLevel }</p>
              <p>show in list of pages: { listedInPagesIndex ? 'true' : 'false' }</p>
              <h3>Authorized to edit this page:</h3>
              <ul className='list-unstyled'>
                { editors }
              </ul>
            </div>
          </div>
        );
        break;
    }

    return content;
  }

  render() {
    const { data, loaded } = this.state;

    if (!loaded || !data.wikiPage) {
      return (
        <Loading />
      );
    }

    const content = this.makeContent(this.props, data);

    const subreddit = this.props.subredditName;
    const urlPrefix = subreddit ? `/r/${subreddit}` : '';

    const path = this.props.ctx.path;
    const revisionActive = path.indexOf('/wiki/revisions') !== -1 ? 'active' : '';
    const pagesActive = path.indexOf('/wiki/pages') !== -1 ? 'active' : '';

    return (
      <div className='container wikiPage-wrapper'>
        <TextSubNav>
          <li className='TextSubNav-li' active={ revisionActive } >
            <a
              className={ `TextSubNav-a ${revisionActive}` }
              href={ `${urlPrefix}/wiki/revisions` }
            >Revisions</a>
          </li>
          <li className='TextSubNav-li' active={ pagesActive } >
            <a
              className={ `TextSubNav-a ${pagesActive}` }
              href={ `${urlPrefix}/wiki/pages` }
            >Pages</a>
          </li>
        </TextSubNav>
         { content }
      </div>
    );
  }
}

export default WikiPageComp;
