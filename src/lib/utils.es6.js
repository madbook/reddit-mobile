"use strict";

var utils = {
  cleanHtml(html) {
    if (html) {
      return html
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#32;/g, ' ')
        .replace(/&#33;/g, '!')
        .replace(/&#34;/g, '"')
        .replace(/&#35;/g, '#')
        .replace(/&#36;/g, '$')
        .replace(/&#37;/g, '%')
        .replace(/&#38;/g, '&')
        .replace(/&#39;/g, '\'')
        .replace(/&#40;/g, '(')
        .replace(/&#41;/g, ')')
        .replace(/&#42;/g, '*')
        .replace(/&#43;/g, '+')
        .replace(/&#44;/g, ',')
        .replace(/&#45;/g, '-')
        .replace(/&#46;/g, '.')
        .replace(/&#47;/g, '/');
    }
    return html;
  }
};

export default utils;
