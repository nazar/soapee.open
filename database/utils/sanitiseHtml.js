const marked = require('marked');
const sanitizeHtml = require('sanitize-html');

function sanitiseHtml(input) {
  return sanitizeHtml(input, {
    allowedTags: ['h1', 'h2', 'h3', 'blockquote', 'p', 'a', 'ul', 'ol', 'img',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br', 'div', 'span',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'],
    allowedAttributes: {
      a: ['href', 'rel'],
      img: ['src', 'width', 'height'],
      p: ['class'],
      span: ['style', 'class']
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'nofollow noopener noreferrer',
        target: '_blank'
      })
    }
  });
}

module.exports.sanitiseHtml = sanitiseHtml;

function stripAllHtml(input) {
  if (input) {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {}
    });
  } else {
    return null;
  }
}

module.exports.stripAllHtml = stripAllHtml;

module.exports.markedToHtml = function(input) {
  if (input) {
    const markedUp = marked(input, {
      breaks: true,
      smartypants: true
    });

    return sanitiseHtml(markedUp);
  } else {
    return null;
  }
};

module.exports.markedToText = function(input) {
  const markedUp = marked(input, {
    breaks: true,
    smartypants: true
  });

  return stripAllHtml(markedUp);
};
