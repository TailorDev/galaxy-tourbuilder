/* @flow */

const getElementName = (element: Element, origin: string) => {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element instanceof HTMLAnchorElement && element.href !== '') {
    return `a[href$="${element.href.replace(origin, '')}"]`;
  }

  if (element.className) {
    return `.${element.className.trim().replace(' ', '.')}`;
  }

  return (element.tagName || '').toLowerCase() || null;
};

export const path = (element: Element, origin: any) => {
  if (element.id) {
    return `#${element.id}`;
  }

  const parts = [getElementName(element, origin)];
  let parent: ?Element = element.parentElement;

  while (parent) {
    if (parent.id) {
      // buttons usually have children for icon, text, etc., but we are not
      // interested in them
      if (parent instanceof HTMLButtonElement) {
        parts.pop();
      }

      parts.push(`#${parent.id}`);
      break;
    }

    const name = getElementName(parent, origin);

    if (name && /html/i.test(name)) {
      break;
    }

    if (name && !/^(div)$/.test(name)) {
      parts.push(name);
    }

    parent = parent.parentElement;
  }

  return parts.reverse().join(' ');
};

export const toggleClass = (el: ?HTMLElement, className: string) => {
  if (!el) {
    return;
  }

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

export const toggleAttribute = (el: ?HTMLElement, attr: string, value: any) => {
  if (!el) {
    return;
  }

  if (el.hasAttribute(attr)) {
    el.removeAttribute(attr);
  } else {
    el.setAttribute(attr, value || attr);
  }
};
