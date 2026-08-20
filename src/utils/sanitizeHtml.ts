import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'b', 'strong', 'i', 'em',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'br', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });
};
