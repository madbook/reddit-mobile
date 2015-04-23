import React from 'react';

class FAQPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12'>
              <h1>Mobile Beta FAQ</h1>

              <dl className='h4'>
                <dt>What is this? Who are you? Where am I?</dt>
                <dd>
                  This is a very early development build of an official, new
                  reddit mobile web. The goal is to get something out as
                  quickly as possible for rapid design and feature iteration,
                  especially involving our current reddit community (you.) Our
                  goal is to make an excellent reddit experience for your
                  mobile devices. Things may be broken, or not fully designed
                  yet, but everything should be usable and give you a feel for
                  the direction we're moving in.
                </dd>

                <dt>When you say mobile devices, what do you mean?</dt>
                <dd>
                  The interface should look good on phones (depending on the
                  phone, with more or less fancy functionality.) It should look
                  <em> okay</em> on tablets - which will get better as we progress.
                  It may or may not be decent on desktop.
                </dd>

                <dt>What works?</dt>
                <dd>
                  You should expect that:

                  <ul>
                    <li>Homepage</li>
                    <li>Subreddits</li>
                    <li>Login</li>
                    <li>Viewing comments</li>
                    <li>Voting on links and comments</li>
                    <li>Viewing user profiles</li>
                    <li>Commenting</li>
                  </ul>

                  All works. Posting, managing settings, and all the rest of
                  the features will come soon.
                </dd>

                <dt>How does this affect Alien Blue or other reddit apps?</dt>
                <dd>
                  It doesn't. The goal of mobile web is to, eventually, provide
                  all desktop functionality - from posting to mod tools to
                  gilding - independent of AlienBlue, the AMA app, or anything
                  else.
                </dd>

                <dt>
                  This is missing [feature X]! Does this mean reddit is getting
                  rid of it or that mobile web isn't implementing it?
                </dt>
                <dd>
                  Mobile web is being released to a public beta far before it's
                  it can be called "ready". If it's missing a feature, it's
                  coming, it just may be prioritized to happen later on.
                </dd>

                <dt>
                  reddit.com is open source. What about mobile web?
                </dt>
                <dd>
                  You can get all of the source, such as it is, on&nbsp;
                  <a href='https://github.com/reddit/reddit-mobile'>github</a>.
                  It's in a very early development state, so things might be a
                  little messy. Our tech stack uses io.js, React, and the
                  reddit APIs (using oauth). Getting it up and running should
                  be a very simple process (install iojs, install dependencies,
                  build, and run.)
                </dd>

                <dt>
                  [X feature] is broken!
                </dt>
                <dd>
                  Hopefully, most things that you can see are working at this
                  stage, but feel free to leave feedback at&nbsp;
                  <a href='https://reddit.com/r/mobileweb'>r/mobileweb</a>&nbsp;
                  after checking for duplicate issues.
                </dd>

                <dt>
                  This is ugly and I hate you / this is great and I love you.
                </dt>
                <dd>
                  We're working on building a great interface. We can't please
                  everyone, but we do welcome criticism. Please feel free to
                  leave feedback at&nbsp;
                  <a href='https://reddit.com/r/mobileweb'>r/mobileweb</a>&nbsp;
                  after checking for duplicate issues..
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  }

  static populateData (api, props, synchronous) {
    var defer = q.defer();
    defer.resolve();
    return defer.promise;
  }
};

function FAQPageFactory(app) {
  return app.mutate('core/pages/faq', FAQPage);
}

export default FAQPageFactory;
