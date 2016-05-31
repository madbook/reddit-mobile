import throttle from 'lodash/throttle';

const elementCanScroll = (el) => {
  const top = el.scrollTop;

  if (top <= 0) {
    el.scrollTop = 1;
    return false;
  }

  const totalScroll = top + el.offsetHeight;
  if (totalScroll === el.scrollHeight) {
    el.scrollTop = top - 1;
    return false;
  }

  return true;
};

export const stopScroll = (elClass, delay=50) => {
  return throttle(function stopScroll(e) {
    let touchMoveAllowed = false;
    let target = e.target;

    while (target !== null) {
      if (target.classList && target.classList.contains(elClass)) {
        if (elementCanScroll(target)) {
          touchMoveAllowed = true;
        }
        break;
      }

      target = target.parentNode;
    }

    if (!touchMoveAllowed) {
      e.preventDefault();
    }
  }, delay);
};
