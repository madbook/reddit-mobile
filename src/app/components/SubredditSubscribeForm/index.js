import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Form } from 'platform/components';

export const SubredditSubscribeForm = (props) => {
  const { uuid, fullName, isSubscriber, className, renderBody } = props;

  return (
    <Form
      action='/actions/toggle-subreddit-subscription'
      className={ className }
    >
      <input type='hidden' name='subredditName' value={ uuid } />
      <input type='hidden' name='fullName' value={ fullName } />
      <input type='hidden' name='isSubscriber' value={ isSubscriber } />
      { renderBody(isSubscriber) }
    </Form>
  );
};

const subredditSelector = (state, props) => state.subreddits[props.subredditName];
const classNameSelector = (_, props) => props.className;
const renderBodySelector = (_, props) => props.renderBody;

const combineSelectors = (subreddit, className, renderBody) => {
  const { uuid, name, userIsSubscriber } = subreddit;
  return {
    uuid,
    fullName: name,
    isSubscriber: userIsSubscriber,
    className,
    renderBody,
  };
};

const makeSelector = () => {
  return createSelector(
    subredditSelector,
    classNameSelector,
    renderBodySelector,
    combineSelectors,
  );
};

export default connect(makeSelector)(SubredditSubscribeForm);
