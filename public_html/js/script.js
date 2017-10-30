'use strict';
const addQuestion = document.getElementById('addQuestion');
const typeQuestion = document.getElementById('typeQuestion');
const questionsBlock = document.getElementById('questions');
const saveQuestionary = document.getElementById('saveQuestionary');
const buttonCompactAll = document.querySelector('.button-compact-all');

let importData = '';

let arrayData = [];

let numberQuestion = 1;
const types = {
  'one': 'Одинарный выбор',
  'multi': 'Множественный выбор',
  'text': 'Текст',
  'description': 'Описание'
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
    deleteQuestion(event.target);
  }

  if (event.target.classList.contains('question-move-up')) {
    moveQuestionUp(event.target.parentNode);
  }
  if (event.target.classList.contains('question-move-down')) {
    moveQuestionDown(event.target.parentNode);
  }
  if (event.target.classList.contains('button-hide')) {
    compactQuestionBlock(event.target);
  }
  if (event.target === saveQuestionary) {
    saveQuestionaryFunc();
  }
  if (event.target === buttonCompactAll) {

  }

}
function addQuestionFunc() {
  const type = typeQuestion.value;

  const newQuestion = createQuestion(numberQuestion, type);

  if (numberQuestion === 1) {
    clearNode(questionsBlock);
  }
  const defaultInput = createInput(numberQuestion + '_1', 'form-control');
  defaultInput.setAttribute('placeholder', 'Текст варианта');
  if (type !== 'text' && type !== 'description') {
    newQuestion.querySelector('.variants-block').insertBefore(defaultInput, newQuestion.querySelector('.variants-block').firstChild);
  }
  questionsBlock.appendChild(newQuestion);
  numberQuestion++;
}
function createQuestion(id, type, text) {
  let divWrapper = createEl('div', 'question-block');
  divWrapper.dataset.type = type;
  divWrapper.dataset.id = id;

  const divUp = createEl('div', 'question-move-up');
  divWrapper.appendChild(divUp);
  const divHelper = createEl('div', 'col-xs-12 question-helper');
  divWrapper.appendChild(divHelper);
  const divType = createEl('div', 'col-xs-8 col-md-10');
  divType.innerText = types[type];
  const divHide = createEl('div', 'col-xs-4 col-md-2 text-right');
  const buttonHide = createEl('button', 'btn btn-default btn-sm button-hide');
  buttonHide.innerText = '-';
  divHide.appendChild(buttonHide);
  divWrapper.appendChild(divType);
  divWrapper.appendChild(divHide);
  let divInput = createEl('div', 'input-group input-block');
  let inputNameQuestion = createInput('questionName' + id, 'form-control question-text');
  if (text) {
    inputNameQuestion.value = text;
  }
  inputNameQuestion.setAttribute('placeholder', 'Текст вопроса');
  let span = createEl('span', 'input-group-btn');
  const buttonDelete = createEl('button', 'btn btn-danger delete-question');
  buttonDelete.innerText = 'Удалить';
  span.appendChild(buttonDelete);

  divInput.appendChild(inputNameQuestion);
  divInput.appendChild(span);
  divWrapper.appendChild(divInput);
  if (type !== 'text' && type !== 'description') {
    const variantsBlock = createEl('div', 'variants-block col-xs-11 col-xs-offset-1 col-md-8 col-md-offset-4');

    const buttonAddVariant = createEl('button', 'btn btn-sm btn-success add-variant');
    buttonAddVariant.innerText = '+';
    variantsBlock.appendChild(buttonAddVariant);
    divWrapper.appendChild(variantsBlock);
  }
  const divDown = createEl('div', 'question-move-down');
  divWrapper.appendChild(divDown);
  return divWrapper;
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
  const newVariant = createVariant(questionId, countVariants);
  parent.insertBefore(newVariant, elem);
}

function createVariant(questionId, count, text) {
  const name = questionId + '_' + (count + 1);
  const newVariant = createInput(name, 'form-control');
  newVariant.setAttribute('placeholder', 'Текст варианта');
  if (text) {
    newVariant.value = text;
  }
  return newVariant;
}

function deleteQuestion(elem) {
  const questionBlock = getParentByClassname(elem, 'question-block');
  if (questionBlock) {
    questionsBlock.removeChild(questionBlock);
  }
}

function getParentByClassname(node, className) {
  let currentNode = node;
  while (currentNode.parentNode) {
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
  readTextFile("data.txt");
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

function saveQuestionaryFunc() {
  arrayData = [];
  const inputs = questionsBlock.querySelectorAll('input');

  Array.from(inputs).forEach(function (value, index) {
    if (value.classList.contains('question-text')) {
      const parent = getParentByClassname(value, 'question-block');
      if (!parent) {
	return false;
      }
      const type = parent.dataset.type;
      const questionId = parent.dataset.id;
      arrayData.push({id: questionId, type: type, text: value.value});
    } else {
      let text = value.value;
      let q_id = value.name.split('_')[0];
      let row = getRowById(q_id);
      if (!row.hasOwnProperty('variants')) {
	row['variants'] = [];
      }
      row.variants.push(text);
    }

  });
  console.log(arrayData);
  console.log(JSON.stringify(arrayData));
}

function getRowById(id) {
  for (let row of arrayData) {
    if (row.hasOwnProperty('id') && row.id === id) {
      return row;
    }
  }
  return null;
}
function compactQuestionBlock(elem) {
  let element = null;
  if (elem.classList.contains('question-block')) {
    element = elem;
  }
  if (!element) {
    element = getParentByClassname(elem, 'question-block');
  }
  if (!element) {
    return false;
  }
  const inputValue = element.querySelector('.question-text').value;
  const buttonHide = element.querySelector('.button-hide');

  if (element.classList.contains('compact')) {
    element.classList.remove('compact');
    buttonHide.innerText = '-';
  } else {
    element.classList.add('compact');
    buttonHide.innerText = '+';
    element.querySelector('.question-helper').innerText = inputValue;
  }
}

function drawQuestionary() {
  const jsonArray = JSON.parse(importData);
  if (!jsonArray) {
    return false;
  }
  clearNode(questionsBlock);
  let maxId = 1;
  for (let row of jsonArray) {

    if (!row.hasOwnProperty('id') || !row.hasOwnProperty('type')) {
      return false;
    }

    const currentId = parseInt(row.id);
    //console.log(currentId);
    if (currentId > maxId) {
      maxId = currentId;
    }

    const newQuestionBlock = createQuestion(currentId, row.type, row.text);
    if (row.variants) {
      let newVariants = createVariants(currentId, row.variants);
      const variantsBlock = newQuestionBlock.querySelector('.variants-block');
      const buttonAddVariant = variantsBlock.querySelector('.add-variant');
      newQuestionBlock.querySelector('.variants-block').insertBefore(newVariants, buttonAddVariant);
    }
    questionsBlock.appendChild(newQuestionBlock);

  }
  numberQuestion = maxId + 1;
  console.log(numberQuestion);
}

function createVariants(id, variants) {
  const fragment = document.createDocumentFragment();

  for (let variantText of variants) {
    fragment.appendChild(createVariant(id, variants.length, variantText));
  }

  return fragment;
}

function readTextFile(file) {
  const rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status === 0) {
	let allText = rawFile.responseText;
	importData = allText;
      }
    }
  };
  rawFile.send(null);
}

function compactAll() {
  
}
