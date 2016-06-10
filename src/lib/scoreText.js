export default function scoreText(score, scoreHidden) {
  if (scoreHidden) {
    return '–';
  } else if (score < 1000) {
    return `${score}`;
  } else if (score < 1100) {
    return '1k';
  }

  return `${(score/1000).toFixed(1)}k`;
}
