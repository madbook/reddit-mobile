export const TOGGLE_EXPANDED = 'TOGGLE_EXPANDED';
export const toggleExpanded = postId => ({
  type: TOGGLE_EXPANDED,
  postId,
});

export const TOGGLE_NSFW_BLUR = 'TOGGLE_NSFW_BLUR';
export const toggleNSFWBlur = postId => ({
  type: TOGGLE_NSFW_BLUR,
  postId,
});
