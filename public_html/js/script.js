'use strict';
let addQuestion = null;
let typeQuestion = null;
let questionsBlock = null;
let saveQuestionary = null;
let buttonCompactAll = null;
let buttonHideAll = null;
const questionsConstructor = document.querySelector('.questions-constructor');
const questionaryTemplate = document.querySelector('.questionary-template');
const controlButtons = document.getElementById('controlButtons');
let importData = '';
let arrayData = [];
let numberQuestion = 1;
let templateId = null;
const types = {
  'one': 'Одинарный выбор',
  'multi': 'Множественный выбор',
  'text': 'Текст',
  'description': 'Описание'
};
const urlView = '/ws/template/view';
const urlCreate = '/ws/template/create';
const urlUpdate = '/ws/template/update';
const urlSave = '/ws/template/save';

init();
function createEl(type, className) {
  const element = document.createElement(type);
  if (className) {
    element.className = className;
  }
  return element;
}

function getParameterByName(name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	  results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function createInput(name, className, type) {
  const element = createEl('input', className);
  element.setAttribute('name', name);
  if (type) {
    element.setAttribute('type', type);
  }
  return element;
}

function clickFunc(event) {
//event.preventDefault();
  if (event.target === addQuestion) {
    addQuestionFunc();
  }
  if (event.target.classList.contains('add-variant')) {
    event.preventDefault();
    addVariant(event.target);
  }

  if (event.target.classList.contains('delete-question')) {
    event.preventDefault();
    deleteQuestion(event.target);
  }

  if (event.target.classList.contains('question-move-up')) {
    event.preventDefault();
    moveQuestionUp(event.target.parentNode);
  }
  if (event.target.classList.contains('question-move-down')) {
    event.preventDefault();
    moveQuestionDown(event.target.parentNode);
  }
  if (event.target.classList.contains('button-hide')) {
    event.preventDefault();
    compactQuestionBlock(event.target);
  }
  if (event.target === saveQuestionary) {
    event.preventDefault();
    saveQuestionaryFunc();
  }
  if (event.target === buttonCompactAll) {
    compactAllQuestions();
  }
  if (event.target === buttonHideAll) {
    hideAllQuestions();
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
  localStorage.removeItem('last_question');
  if (window.location.pathname !== urlView) {
    console.log(window.location.pathname);
    drawControlButtons();
    drawConstructorBlock();

    addQuestion = document.getElementById('addQuestion');
    typeQuestion = document.getElementById('typeQuestion');
    questionsBlock = document.getElementById('questions');
    saveQuestionary = document.getElementById('saveQuestionary');
    buttonCompactAll = document.querySelector('.button-compact-all');
    buttonHideAll = document.querySelector('.button-hide-all');

    fillVariantsType();
  }
  document.body.addEventListener('click', clickFunc);
  let id = getParameterByName('id');
  //console.log(id);
  if (id) {
    templateId = id;
    sendData('/ws/template/get-template?id=' + id, '');
  }
  readTextFile("http://localhost:3000/data.txt");
}

function drawControlButtons() {
//controlButtons.
  /*<div class="btn-group" role="group">
   <button class="btn btn-primary btn-sm button-compact-all">Сжать</button>
   <button class="btn btn-warning btn-sm button-hide-all">Скрыть</button>
   </div>*/
  const btnGroup = createEl('div', 'btn-group');
  const btnCompact = createEl('button', 'btn btn-primary btn-sm button-compact-all');
  btnCompact.innerText = 'Сжать';
  const btnHide = createEl('button', 'btn btn-warning btn-sm button-hide-all');
  btnHide.innerText = 'Скрыть';
  btnGroup.appendChild(btnCompact);
  btnGroup.appendChild(btnHide);
  controlButtons.appendChild(btnGroup);
}
function drawConstructorBlock() {
//  <div class="col-xs-12">
//	    <div class="row">
//		<h3>Вопросы</h3>
//	    </div>
//  </div>
//  <div class="col-xs-12">
//      <div id="questions" class="row">
//	  <p>Добавьте вопрос</p>
//      </div>
//  </div>
//  <div class="col-xs-12">
//      <div class="row">
//	  <button id="saveQuestionary" class="btn btn-success">Сохранить</button>
//	  <hr />
//      </div>
//  </div>
//  <hr />
//  <div class="input-group">
//      <select id="typeQuestion" class="form-control"></select>
//      <span class="input-group-btn">
//	  <button id="addQuestion" class="btn btn-success">Добавить</button>
//      </span>
//  </div>
  const divHead = createEl('div', 'col-xs-12');
  const divRow = createEl('div', 'row');
  const hText = createEl('h3', '');
  hText.innerText = 'Вопросы';
  divRow.appendChild(hText);
  divHead.appendChild(divRow);
  questionsConstructor.appendChild(divHead);
  const divPlaceQuestions = createEl('div', 'col-xs-12');
  const divQuestions = createEl('div', 'row');
  divQuestions.setAttribute('id', 'questions');
  const pWord = createEl('p', '');
  pWord.innerText = 'Добавьте вопрос';
  divQuestions.appendChild(pWord);
  divPlaceQuestions.appendChild(divQuestions);
  questionsConstructor.appendChild(divPlaceQuestions);

  const divButtonBlock = createEl('div', 'col-xs-12');
  const divButtonBlockRow = createEl('div', 'row');
  const buttonSave = createEl('button', 'btn btn-success');
  buttonSave.innerText = 'Сохранить';
  buttonSave.setAttribute('id', 'saveQuestionary');
  divButtonBlockRow.appendChild(buttonSave);
  divButtonBlockRow.appendChild(createEl('hr', ''));
  divButtonBlock.appendChild(divButtonBlockRow);
  questionsConstructor.appendChild(divButtonBlock);

  questionsConstructor.appendChild(createEl('hr', ''));

  const divInputGroup = createEl('div', 'input-group');
  const selectType = createEl('select', 'form-control');
  selectType.setAttribute('id', 'typeQuestion');
  divInputGroup.appendChild(selectType);
  const spanInput = createEl('span', 'input-group-btn');
  const buttonAddQ = createEl('button', 'btn btn-success');
  buttonAddQ.setAttribute('id', 'addQuestion');
  buttonAddQ.innerText = 'Добавить';
  spanInput.appendChild(buttonAddQ);
  divInputGroup.appendChild(spanInput);
  questionsConstructor.appendChild(divInputGroup);
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
  let url = urlSave;
  if (templateId) {
    url = urlUpdate + '?id=' + templateId;
  }
  sendData(url, JSON.stringify(arrayData));
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
  arrayData = jsonArray;
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

function sendData(url, data) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', (e) => {
    console.log(xhr.response);
    readInstruction(xhr.response);
  });
  xhr.open("POST", url);
  xhr.send(data);
}

function readInstruction(data) {
//console.log(typeof data);
  data = JSON.parse(data);
  if (!data.hasOwnProperty('error')) {
    console.log('no error attribute');
    return false;
  }

  if (data.hasOwnProperty('message')) {
    console.log(data.message);
  }

  if (data.hasOwnProperty('reload')) {
    window.location.reload();
  }

  if (data.hasOwnProperty('url')) {
    window.location.href = data.url;
  }

  if (data.hasOwnProperty('data')) {
    importData = data.data;
    if (window.location.pathname === '/ws/template/create' || window.location.pathname === '/ws/template/update') {
      drawQuestionary();
    }
    if (window.location.pathname === '/ws/template/view') {
      drawTemplate();
    }
  }

}

function compactAllQuestions() {
  const questions = questionsBlock.querySelectorAll('.question-block');
  Array.from(questions).forEach(function (value) {
    compactQuestionBlock(value);
  });
}
function hideAllQuestions() {
  const constructor = document.querySelector('.questions-constructor');
  if (constructor.classList.contains('hide')) {
    constructor.classList.remove('hide');
    buttonHideAll.innerText = 'Скрыть';
  } else {
    constructor.classList.add('hide');
    buttonHideAll.innerText = 'Показать';
  }
}

function drawTemplate(count) {
  const key = 'last_question';
  const jsonArray = JSON.parse(importData);
  arrayData = jsonArray;
  clearNode(questionaryTemplate);
  let last_question = parseInt(localStorage.getItem(key));
  if (last_question === arrayData.length) {
    localStorage.removeItem(key);
  }
  console.log('last_question: ' + last_question);
  let iter = 0;
  let countDrawed = 0;
  for (let row of arrayData) {
    if (last_question && last_question > iter) {
      iter++;
      continue;
    }
    questionaryTemplate.appendChild(drawQuestion(row));
    iter++;
    countDrawed++;
    if (count && count < countDrawed+1) {
      localStorage.setItem(key, iter+1);
      break;
    }
  }
  console.log('arrayData.length: ' + arrayData.length);
  if (arrayData.length === iter || arrayData.length === last_question) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, iter);
  }
}

function drawQuestion(row) {
  const type = row.type;
  let id = row.id;
  const text = row.text;
  let name = 'q_' + id;
  const divWrap = createEl('div', 'form-group');
  if (type === 'one' || type === 'multi') {
    const p = createEl('p', '');
    p.innerText = text;
    divWrap.appendChild(p);
    if (!row.hasOwnProperty('variants')) {
      return false;
    }
    const variants = row.variants;
    let typeInput = 'radio';
    let classInput = 'radio';
    if (type === 'multi') {
      typeInput = 'checkbox';
      classInput = 'checkbox';
      name = 'q_' + id + '[]';
    }
    const selectBlock = createEl('div', '');
    for (let variant of variants) {
      const divVar = createEl('div', classInput);
      const label = createEl('label', '');
      const inputVariant = createInput(name, '', typeInput);
      inputVariant.value = variant;
      label.appendChild(inputVariant);
      const textNode = document.createTextNode(variant);
      label.appendChild(textNode);
      divVar.appendChild(label);
      selectBlock.appendChild(divVar);
    }
    divWrap.appendChild(selectBlock);
  } else if (type === 'text') {
    const row = createEl('div', 'row');
    const labelPart = createEl('div', 'col-xs-12 col-md-4');
    const p = createEl('p', '');
    p.innerText = text;
    labelPart.appendChild(p);
    row.appendChild(labelPart);
    const fieldPart = createEl('div', 'col-xs-12 col-md-8');
    const inputText = createInput(name, 'form-control');
    fieldPart.appendChild(inputText);
    row.appendChild(fieldPart);
    divWrap.appendChild(row);
  } else {
    const p = createEl('h4', '');
    p.innerText = text;
    divWrap.appendChild(p);
  }
  return divWrap;
}
