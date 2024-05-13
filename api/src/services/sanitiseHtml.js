import sanitizeHtml from 'sanitize-html';

export default function sanitiseHtml(input) {
  return sanitizeHtml(input, {
    allowedTags: ['h1', 'h2', 'h3', 'blockquote', 'p', 'a', 'ul', 'ol', 'img',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br', 'div', 'span',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe'],
    allowedAttributes: {
      a: ['href', 'rel'],
      img: ['src', 'width', 'height'],
      p: ['class'],
      span: ['style', 'class'],
      iframe: ['src', 'width', 'height']
    },
    allowedIframeHostnames: ['www.youtube.com'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'nofollow noopener noreferrer',
        target: '_blank'
      })
    }
  });
}

export function stripAllHtml(input) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
}

export function yupStringSanitize(value, originalValue) {
  if (originalValue) {
    return sanitiseHtml(originalValue);
  } else {
    return value;
  }
}
