'use strict';

const addQuestion = document.getElementById('addQuestion');
const typeQuestion = document.getElementById('typeQuestion');
const questionsBlock = document.getElementById('questions');

let numberQuestion = 1;
const types = {
    'one': 'Одинарный выбор',
    'multi': 'Множественный выбор',
    'text': 'Текст'
};

init();

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

function clickFunc(event) {
    event.preventDefault();
    if (event.target === addQuestion) {
        addQuestionFunc();
    }
    if (event.target.classList.contains('add-variant')) {
        addVariant(event.target);
    }
    
    if (event.target.classList.contains('delete-question')) {
        deleteVariant(event.target);
    }
    
    if (event.target.classList.contains('question-move-up')) {
        moveQuestionUp(event.target.parentNode);
    }
    if (event.target.classList.contains('question-move-down')) {
        moveQuestionDown(event.target.parentNode);
    }
}
function addQuestionFunc() {
    const type = typeQuestion.value;
    const fragment = document.createDocumentFragment();
    let divWrapper = createEl('div', 'question-block');
    divWrapper.dataset.type = type;
    divWrapper.dataset.id = numberQuestion;

    const divUp = createEl('div', 'question-move-up');
    divWrapper.appendChild(divUp);
    
    const divType = createEl('div', 'col-xs-12');
    divType.innerText = types[type];
    divWrapper.appendChild(divType);
    let divInput = createEl('div', 'input-group input-block');
    let inputNameQuestion = createInput('questionName' + numberQuestion, 'form-control');
    inputNameQuestion.setAttribute('placeholder', 'Текст вопроса');
    let span = createEl('span', 'input-group-btn');
    const buttonDelete = createEl('button', 'btn btn-danger delete-question');
    buttonDelete.innerText = 'Удалить';
    span.appendChild(buttonDelete);
    
    divInput.appendChild(inputNameQuestion);
    divInput.appendChild(span);
    divWrapper.appendChild(divInput);
    if (type !== 'text') {
        const variantsBlock = createEl('div', 'variants-block col-xs-11 col-xs-offset-1 col-md-8 col-md-offset-4');
        const defaultInput = createInput(numberQuestion + '_1', 'form-control');
        defaultInput.setAttribute('placeholder', 'Текст варианта');
        variantsBlock.appendChild(defaultInput);
        const buttonAddVariant = createEl('button', 'btn btn-sm btn-success add-variant');
        buttonAddVariant.innerText = '+';
        variantsBlock.appendChild(buttonAddVariant);
        divWrapper.appendChild(variantsBlock);
    }
    const divDown = createEl('div', 'question-move-down');
    divWrapper.appendChild(divDown);
    if (numberQuestion === 1) {
        clearNode(questionsBlock);
    }
    questionsBlock.appendChild(divWrapper);
    numberQuestion++;
}

function addVariant(elem) {
    const parent = elem.parentNode;
    if (parent.parentNode.dataset.type === 'text') {
        parent.removeChild(elem);
        return false;
    }
    const questionId = parent.parentNode.dataset.id;
    const variants = parent.querySelectorAll('input.form-control');
    const countVariants = variants.length;
    let name = questionId + '_' + (countVariants + 1);
    const newVariant = createInput(name, 'form-control');
    newVariant.setAttribute('placeholder', 'Текст варианта');
    parent.insertBefore(newVariant, elem);
}

function deleteVariant(elem) {
    const questionBlock = getParentByClassname(elem, 'question-block');
    if (questionBlock) {
        questionsBlock.removeChild(questionBlock);
    }
}

function getParentByClassname(node, className) {
    let currentNode = node;
    while(currentNode.parentNode) {
        if (currentNode.parentNode.classList.contains(className)) {
            return currentNode.parentNode;
        }
        currentNode = currentNode.parentNode;
    }
    return null;
}

function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}
function init() {
    fillVariantsType();
    document.body.addEventListener('click', clickFunc);
}

function fillVariantsType() {
    
    for (let index in types) {
        const option = document.createElement('option');
        option.setAttribute('value', index);
        option.innerText = types[index];
        typeQuestion.appendChild(option);
    }
}
function moveQuestionUp(elem) {
    moveQuestion(elem, true);
}

function moveQuestionDown(elem) {
    moveQuestion(elem, false);
}

function moveQuestion(node, up) {
    const upperChildren = node.previousSibling;
    const lowerChildren = node.nextSibling;
    const copyNode = node.cloneNode(true);
    
    if (!up) {
        if (!lowerChildren) {
            return false;
        }
        if (lowerChildren.nextSibling) {
            questionsBlock.insertBefore(copyNode, lowerChildren.nextSibling);
        } else {
            questionsBlock.appendChild(copyNode);
        }
    } else {
        if (!upperChildren) {
            return false;
        }
        questionsBlock.insertBefore(copyNode, upperChildren);
    }
    questionsBlock.removeChild(node);
}