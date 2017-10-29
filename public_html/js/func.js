'use strict';

function createEl(type, className) {
    const element = document.createElement(type);
    if (className) {
        element.className = className;
    }
    return element;
}

function createInput(name, className) {
    const element = createEl('input', className);
    element.setAttribute('name', name);
    return element;
}
