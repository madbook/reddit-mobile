import React from 'react';
import { models } from '@r/api-client';

import propTypes from '../../../propTypes';
import BaseComponent from '../BaseComponent';
import PostDropdown from './PostDropdown';

const T = React.PropTypes;

// 'Controller' class to render a PostDropdown(View) and handle the ui actions

export default class PostDropdownController extends BaseComponent {
  static propTypes = {
    dropdownTarget: T.object.isRequired, // Dom Node
    post: propTypes.listing.isRequired,
    user: T.object,
    single: T.bool.isRequired,
    saved: T.bool.isRequired,
    onCloseDropdown: T.func.isRequired,
    app: T.object.isRequired,
    apiOptions: T.object.isRequired,
    viewComments: T.bool.isRequired,
    onEdit: T.func.isRequired,
    onReport: T.func.isRequired,
    onHide: T.func.isRequired,
    onDelete: T.func.isRequired,
    onSave: T.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.hidePost = this.hidePost.bind(this);
    this.savePost = this.savePost.bind(this);
    this.editPost = this.editPost.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.reportPost = this.reportPost.bind(this);
  }

  render() {
    const {
      post,
      user,
      single,
      dropdownTarget,
      onCloseDropdown,
      app,
      viewComments,
      saved,
    } = this.props;

    const userLoggedIn = !!user;
    const userOwned = userLoggedIn && post.author === user.name;
    const showingEditAndDel = userOwned && single;

    return (
      <PostDropdown
        dropdownTarget={ dropdownTarget }
        post={ post }
        saved={ saved }
        userLoggedIn={ userLoggedIn }
        userOwned={ userOwned }
        showingEditAndDel={ showingEditAndDel }
        onCloseDropdown={ onCloseDropdown }
        app={ app }
        viewComments={ viewComments }
        handleReportPost={ this.reportPost }
        handleEditPost={ this.editPost }
        handleDeletePost={ this.deletePost }
        handleHidePost={ this.hidePost }
        handleSavePost={ this.savePost }
      />
    );
  }

  hidePost() {
    if (this.props.app.needsToLogInUser()) { return; }

    const { post, app, apiOptions } = this.props;

    const options = Object.assign(app.api.buildOptions(apiOptions), {
      id: post.name,
      type: post._type.toLowerCase(),
    });

    const newHidden = !post.hidden;

    if (post.hidden) {
      app.api.hidden.delete(options).then(() => {});
    } else {
      app.api.hidden.post(options).then(() => {});
    }


    this.props.onHide(newHidden);
    this.props.onCloseDropdown();
  }

  savePost() {
    if (this.props.app.needsToLogInUser()) { return; }

    const { post, saved, app, apiOptions } = this.props;

    const options = Object.assign(app.api.buildOptions(apiOptions), {
      id: post.name,
      type: post._type.toLowerCase(),
    });

    if (saved) {
      app.api.saved.delete(options).then(() => {
        this.props.onSave(false);
      });
    } else {
      app.api.saved.post(options).then(() => {
        this.props.onSave(true);
      });
    }

    this.props.onCloseDropdown();
  }

  editPost() {
    const { onEdit } = this.props;
    onEdit(); // ListingPage handles editing
    this.props.onCloseDropdown();
  }

  deletePost() {
    const { onDelete, post } = this.props;
    onDelete(post.name); // ListingPage handles deleteing
    this.props.onCloseDropdown();
  }

  reportPost(reason) {
    if (this.props.app.needsToLogInUser()) { return; }

    const { post, app, apiOptions } = this.props;

    const id = post.name;
    const report = new models.Report({
      thing_id: id,
      reason: 'other',
      other_reason: reason,
    });

    const options = Object.assign(app.api.buildOptions(apiOptions), {
      model: report,
    });

    app.api.reports.post(options).then(() => {});
    app.api.emit('report', post.id);

    this.props.onReport();
    this.props.onCloseDropdown();
  }
}
