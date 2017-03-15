import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as modalActions from 'app/actions/modal';
import * as rulesModalActions from 'app/actions/rulesModal';
import Loading from 'app/components/Loading';
import SubredditRule from 'app/components/SubredditRule';
import { getSubredditRulesFromState } from 'lib/subredditRules';

const T = React.PropTypes;

/**
 * Component for rendering the rules modal.
 * @param {Object} props
 * @returns {React.Component}
 */
function RulesModal(props) {
  const {
    onClickAccept,
    onClickDecline,
    onClickInside,
    onClickOutside,
    rules,
    subredditName,
  } = props;

  return (
    <div className='RulesModal' onClick={ onClickOutside }>
      <div className="RulesModal__modal" onClick={ onClickInside }>
        { rules 
          ? <div className="RulesModal__body">
              <header className="RulesModal__header">
                <h2 className="RulesModal__title">
                  Rules for r/{ subredditName }
                </h2>
                <p className="RulesModal__description">
                  The moderators ask you to observe these rules:
                </p>
              </header>
              <div className="RulesModal__rules">
                { rules.map(r => <SubredditRule { ...r } />) }
              </div>
              <footer className="RulesModal__footer">
                <a 
                    className="RulesModal__rulesLink"
                    href="/r/{ subredditName }/about/rules"
                    target="_blank"
                    >
                  View the full list of rules.
                </a>
                <div className="RulesModal__footerButtonRow">
                  <button
                      className="RulesModal__button RulesModal__declineButton"
                      onClick={ onClickDecline }
                      >
                    Decline
                  </button>
                  <button
                      className="RulesModal__button RulesModal__acceptButton"
                      onClick={ onClickAccept }
                      >
                    Agree
                  </button>
                </div>
              </footer>
            </div>

          : <Loading />
        }
      </div>
    </div>
  );
}

RulesModal.propTypes = {
  featureName: T.string.isRequired,
  isRequired: T.bool.isRequired,
  thingType: T.string.isRequired,
  onClickAccept: T.func,
  onClickDecline: T.func,
  onClickInside: T.func,
  onClickOutside: T.func.isRequired,
  onDecline: T.object,
  rules: T.arrayOf(T.shape(SubredditRule.propTypes)),
  subredditName: T.string.isRequired,
};

RulesModal.defaultProps = {
  onClickAccept: () => {},
  onClickDecline: () => {},
  onClickInside: () => {},
  rules: null,
  onDecline: null,
};

const selector = createSelector(
  (state, props) => getSubredditRulesFromState(state, props.subredditName, props.thingType),
  rules => ({
    rules,
  }),
);

function dispatcher(dispatch, ownProps) {
  const {
    featureName,
    isRequired,
    onDecline,
    subredditName,
  } = ownProps;

  return {
    onClickOutside: () => {
      if (!isRequired) { return; }
      dispatch(rulesModalActions.accept(featureName, subredditName));
      dispatch(modalActions.closeModal());
    },
    onClickAccept: () => {
      dispatch(rulesModalActions.accept(featureName, subredditName));
      dispatch(modalActions.closeModal());
    },
    onClickDecline: () => {
      dispatch(modalActions.closeModal());
      if (onDecline) {
        dispatch(onDecline);
      }
    },
  };
}

export default connect(selector, dispatcher)(RulesModal);
