const getElementName = (element, origin) => {
  if (element.id) {
    return `#${element.id}`;
  }

  if (
    element.tagName &&
    element.tagName.toLowerCase() === 'a' &&
    element.href !== ''
  ) {
    return `a[href$="${element.href.replace(origin, '')}"]`;
  }

  if (element.className) {
    return `.${element.className.replace(' ', '.')}`;
  }

  return (element.tagName || '').toLowerCase() || null;
};

export const path = (element, origin) => {
  if (element.id) {
    return `#${element.id}`;
  }

  const parts = [getElementName(element, origin)];
  let parent = element.parentNode;

  while (parent) {
    if (parent.id) {
      parts.push(`#${parent.id}`);
      break;
    }

    const name = getElementName(parent, origin);

    if (/html/i.test(name)) {
      break;
    }

    if (name && !/^(div)$/.test(name)) {
      parts.push(name);
    }

    parent = parent.parentNode;
  }

  return parts.reverse().join(' ');
};

export const toggleClass = (el, className) => {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    const classes = el.className.split(' ');
    const existingIndex = classes.indexOf(className);

    if (existingIndex >= 0) {
      classes.splice(existingIndex, 1);
    } else {
      classes.push(className);
    }

    el.className = classes.join(' ');
  }
};

export const toggleAttribute = (el, attr, value) => {
  if (el.hasAttribute(attr)) {
    el.removeAttribute(attr);
  } else {
    el.setAttribute(attr, value || attr);
  }
};
