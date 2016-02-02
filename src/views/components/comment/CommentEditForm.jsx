import React from 'react';

import CommentReplyForm from './CommentReplyForm';

const T = React.PropTypes;

export default class CommentEditForm extends React.Component {
  static propTypes = {
    content: T.string,
    error: T.string,
    onClose: T.func.isRequired,
    onSubmit: T.func.isRequired,
  };
  
  static defaultProps = {
    content: '',
    error: '',
  };
  
  constructor(props) {
    super(props);
    
    this.state = {
      formValue: props.content,
    };
    
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleContentChange(value) {
    this.setState({
      formValue: value,
    });
  }
  
  handleSubmit() {
    this.props.onSubmit(this.state.formValue);
  }
  
  render() {
    const { formValue } = this.state;
    const { error } = this.props;
    
    return (
      <div className='CommentEditForm'>
        <CommentReplyForm
          buttonText='Submit Changes'
          value={ formValue }
          error={ error }
          onContentChange={ this.handleContentChange }
          onClose={ this.props.onClose }
          onReplySubmit={ this.handleSubmit }
        />
      </div>
    );
  }
}
