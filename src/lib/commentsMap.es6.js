function commentsMap(comment, parent, op, score=4, nthSibling=0, nthNest=0, siblingHidden=false) {
  var i = 0;
  var length;

  if (comment == undefined) {
    return;
  }

  // Start degrading
  score--;

  // Show longer threads involving op
  if (comment.author == op || comment.gilded) {
    score++;
  // Show longer threads if a parent has a higher score
  } else if (parent && comment.score > (parent.score * (nthSibling + nthNest + 1))) {
    score++;
  }

  if (nthSibling > score || nthSibling > 5 || nthNest > 5) {
    comment.hidden = true;
  }

  // If score is low, or if it is a long sibling chain, hide
  if (score < 0 || (parent && parent.hidden) || siblingHidden) {
    comment.hidden = true;
  }

  if (comment.hidden && parent && !parent.hidden && !siblingHidden) {
    comment.firstHidden = true;
  }

  comment.hideScore = score;

  if (!comment.replies) {
    return comment;
  }

  length = comment.replies.length;
  i = 0;

  // Increment the nesting level before we recurse through children
  nthNest++;

  comment.replies = comment.replies.map(function(c, i) {
    var sh = siblingHidden;

    if (i > 0) {
      sh = comment.replies[i-1].hidden;
    }

    return commentsMap(c, comment, op, score, i, nthNest, sh);
  });

  return comment;
}

export default commentsMap;
