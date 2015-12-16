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
        const { conversations } = data.wikiPage;
        if (conversations && conversations.length) {
          content = (
            <ListingContainer
              {...props}
              compact={ compact }
              user={ data.user || null }
              showAds={ false }
              listings={ data.wikiPage.conversations }
            />
          );
        } else {
          content = (
            <div className='wikiPage-container'>
              <p>No discussions about this page.</p>
            </div>
          );
        }
        break;
      case PAGETYPES.WIKI_REVISION:
        const revisions = data.wikiPage.revisions.map((wikiRevision)=> {
          const { author, page, timestamp } = wikiRevision;
          return (
            <tr key={ author + timestamp }>
              <td className='wikiPage-revision-author'>{ author.name }</td>
              <td>{ page }</td>
              <td className='wikiPage-revision-date'>{ moment(timestamp * 1000).fromNow() }</td>
            </tr>
          );
        });

        if (revisions.length) {
          content = (
            <div className='wikiPage-container'>
              <h2>Revisions</h2>
              <table className='wikiPage-revision-table'>
                <tbody>
                  <tr>
                    <th>User</th>
                    <th>Page</th>
                    <th>When</th>
                  </tr>
                  { revisions }
                </tbody>
              </table>
            </div>
          );
        } else {
          content = (
            <div className='wikiPage-container'>
              <p>No recent revisions to show.</p>
            </div>
          );
        }
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
        const { content_md, revision_by, revision_date } = data.wikiPage;
        const body = content_md || 'Nothing here...';
        const editor = revision_by.name;
        const date = moment(revision_date * 1000).fromNow();

        content = (
          <div>
            <div className='wikiPage-container'>
              <div
                className='wikiPage-html'
                dangerouslySetInnerHTML={ { __html: process(mobilify(body)) } }
              />
            </div>
            <p className='wikiPage-last-edit'>
              Revision by <span className='bold'>{ editor }</span> - { date }
            </p>
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

        const wikiPath = props.ctx.params.wikiPath;
        const showInIndex = listedInPagesIndex ? 'true' : 'false';

        content = (
          <div className='wikiPage-container'>
            <div>
              <h2 className='wikiPage-settings-title'>Settings for { wikiPath }</h2>
              <p>
                Page editing permissions:
                <span className='bold'> { editingPermissionLevel }</span>
              </p>
              <p>
                show this page on the list of wiki pages:
                <span className='bold'> { showInIndex }</span>
              </p>
              <h4>Authorized to edit this page:</h4>
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

    const { wikiPath, subPath } = this.props.ctx.params;
    const revisionActive = subPath === 'revisions' ? 'active' : '';
    const pagesActive = subPath === 'pages' ? 'active' : '';
    const discussActive = subPath === 'discussions' ? 'active' : '';

    let discussionsLink;
    if (wikiPath) {
      discussionsLink = (
        <li className={ `TextSubNav-li ${discussActive}` } >
          <a
            className='TextSubNav-a'
            href={ `${urlPrefix}/wiki/discussions/${wikiPath}` }
          >
            Discussions
          </a>
        </li>
      );
    }

    const path = wikiPath ? `/${wikiPath}` : '';

    return (
      <div className='container wikiPage-wrapper'>
        <TextSubNav>
          <li className={ `TextSubNav-li ${revisionActive}` } >
            <a
              className='TextSubNav-a'
              href={ `${urlPrefix}/wiki/revisions${path}` }
            >
              Revisions
            </a>
          </li>
          { discussionsLink }
          <li className={ `TextSubNav-li ${pagesActive}` } >
            <a
              className='TextSubNav-a'
              href={ `${urlPrefix}/wiki/pages` }
            >
              Pages
            </a>
          </li>
        </TextSubNav>
         { content }
      </div>
    );
  }
}

export default WikiPageComp;
