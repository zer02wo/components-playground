// Most basic example - appended twice to show reusability
const template = document.querySelector('template');
const node = template.content.cloneNode(true);
const nodeAgain = template.content.cloneNode(true);

document.body.appendChild(node);
document.body.appendChild(nodeAgain);

// Versatility example
const btnTemplate = document.getElementById('btn-template');

document.body.appendChild(btnTemplate.content.cloneNode(true));

// Complex example - dialog
const dialogTemplate = document.getElementById('dialog-template');

document.body.appendChild(dialogTemplate.content.cloneNode(true));
