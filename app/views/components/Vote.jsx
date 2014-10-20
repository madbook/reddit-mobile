/** @jsx React.DOM */

import * as React from 'react';

var d = new Date();
var year = d.getFullYear();

var Vote = React.createClass({
  render: function() {
    var upvotedClass = '';
    var downvotedClass = '';
    var upvoteDirection = 1;
    var downvoteDirection = -1;

    if (this.props.thing.likes === true) {
      upvotedClass = ' voted text-upvote';
      upvoteDirection = 0;
    } else if (this.props.thing.likes === false) {
      downvotedClass = ' voted text-downvote';
      downvoteDirection = 0;
    }

    return (
      <ul className='list-compact-horizontal'>
        <li>
          <a href={ '/vote/' + this.props.thing.name + '?direction=' + upvoteDirection } 
            className={'vote' + upvotedClass } data-vote='up' data-thingid={ this.props.thing.name }>
            <span className='glyphicon glyphicon-circle-arrow-up'></span>
          </a>
        </li>
        <li>
          <span className='vote-score' data-vote-score={this.props.thing.score } data-thingid={ this.props.thing.name }>
            { this.props.thing.score }
          </span>
        </li>
        <li>
          <a href={ '/vote/' + this.props.thing.name + '?direction=' + downvoteDirection } 
            className={'vote' + downvotedClass } data-vote='down' data-thingid={ this.props.thing.name }>
            <span className='glyphicon glyphicon-circle-arrow-down'></span>
          </a>
        </li>
      </ul>
    );
  }
});

export default Vote;
