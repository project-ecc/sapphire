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
  const buttons = options.buttons || [];
  const color = options.color || null;

  const alert = document.createElement('div');
  if (color !== null) {
    alert.className = `bg-${color}`;
  }

  if (title !== null) {
    const titleDom = document.createElement('h5');
    titleDom.innerText = title;
    alert.appendChild(titleDom);
  }

  if (message !== null) {
    const messageDom = document.createElement('div');
    messageDom.innerText = message;
    alert.appendChild(messageDom);
  }

  if (buttons.length > 0) {
    const buttonContainerDom = document.createElement('div');
    buttonContainerDom.className = 'buttons';

    for (const ele in buttons) {
      const buttonDom = document.createElement('a');
      buttonDom.className = 'btn btn-light btn-sm';
      buttonDom.innerText = buttons[ele].title;
      buttonDom.onclick = buttons[ele].method;
      buttonContainerDom.appendChild(buttonDom);
    }

    alert.appendChild(buttonContainerDom);
  }

  container.appendChild(alert);

  setTimeout(() => {
    requestAnimationFrame(() => {
      alert.classList.add('show');
    });
  }, 100);

  setTimeout(() => {
    requestAnimationFrame(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        alert.remove();
      }, 750);
    });
  }, timeout);
}
