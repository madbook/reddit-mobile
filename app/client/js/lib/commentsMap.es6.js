function commentsMap(comment, parent, op, score, nthSibling, siblingHidden) {
  var i = 0;
  var length;

  if (comment == undefined) {
    return;
  }

  // Start degrading
  score--;

  // Show longer threads involving op
  if (comment.author == op) {
    score++;
  // Show longer threads if a parent has a higher score
  } else if (parent && comment.score > parent.score) {
    score++;
  }

  if (nthSibling > score) {
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

  length = comment.replies.length;
  i = 0;

  comment.replies = comment.replies.map(function(c, i) {
    var sh = false;
    if (i > 0) {
      sh = comment.replies[i-1].hidden;
    }

    return commentsMap(c, comment, op, score, i, sh);
  });

  return comment;
}

export default commentsMap;
