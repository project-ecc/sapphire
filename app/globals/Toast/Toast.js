import React from 'react';

function getContainer() {
  let container = document.getElementById('sapphire-toasts');
  if (container === null) {
    container = document.createElement('div');
    container.setAttribute('id', 'sapphire-toasts');

    document.body.appendChild(container);
  }
  return container;
}

export default function (options) {
  const container = getContainer();

  const timeout = options.timeout || 5000;
  const message = options.message || null;
  const title = options.title || null;

  const alert = document.createElement('div');
  if (title !== null) {
    const titleDom = document.createElement('h6');
    titleDom.innerText(title);
    alert.appendChild(titleDom);
  }

  if (message !== null) {
    const messageDom = document.createElement('div');
    messageDom.innerText(message);
    alert.appendChild(messageDom);
  }

  container.appendChild(alert);

  // setTimeout(() => {
  //   alert.remove();
  // }, timeout);
}
