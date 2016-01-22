import shallowHelpers from 'react-shallow-renderer-helpers';

export default (element, string) => {
  //returns undefined if no element with <string> is found.
  return shallowHelpers.find(element, (c) => {
    if (!c || !c.props) {
      return false;
    }

    // In case we are looking for a markdown String
    if (c.props.dangerouslySetInnerHTML) {
      return c.props.dangerouslySetInnerHTML.__html.indexOf(string) !== -1;
    }

    if (typeof c.props.children === 'string') {
      return c.props.children.indexOf(string) !== -1;
    }

    return false;
  });
};
