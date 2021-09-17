const inputTxtWrapper = document.querySelectorAll('.input-text-wrapper');
const inputTxt        = document.querySelectorAll('.input-text');
const toDo            = document.getElementById('todo');
const btnAddToDo      = document.getElementById('btn-add');
const btnClearAll     = document.getElementById('btn-clear-all');
const inputChkToggle  = document.getElementById('input-check-toggle-all');

const DATA_KEY        = '@todo_data';
const DELETE_DELAY    = 500;
const VK_ENTER_SUBMIT = 13;

/**
 * Retrieves items from cache
 * @returns {Array} data
 */
function dataFromStorage() {
    if (localStorage)
        return JSON.parse(localStorage.getItem(DATA_KEY));
}

/**
 * Store new item
 * @param {Object} item 
 */
function store(item) {
    if (localStorage) {
        let data = JSON.parse(localStorage.getItem(DATA_KEY)) || [];

        console.log(data);
        data.push(item);

        localStorage.setItem(DATA_KEY, JSON.stringify(data));
    }
}

/**
 * Remove item from cache
 * @param {Number} itemID 
 */
function remove(itemID) {
    if (localStorage) {
        let data = JSON.parse(localStorage.getItem(DATA_KEY)) || [];
        let indexOf = data.findIndex(item => item.id === itemID);

        console.log('remove', itemID);

        if (indexOf !== -1) {
            data.splice(indexOf, 1);
            localStorage.setItem(DATA_KEY, JSON.stringify(data));
        }
    }
}

/**
 * Clear all cache data
 */
function clearCache() {
    if (localStorage)
        localStorage.setItem(DATA_KEY, JSON.stringify([]));
}

function loadCache() {
    let items = dataFromStorage() || [];
    
    items.forEach(item => {
        addToDoItem(toDo, item);
    });
}

/**
 * Controls text input animation state
 * @param {HTMLElement} inputTxtWrapper - Text input wrapper
 */
function removeFocus(inputTxtWrapper) {
    const input = inputTxtWrapper.querySelector('.input-text');

    if (isInputTxtEmpty(input))
        inputTxtWrapper.classList.remove('focused');
}

/**
 * Controls text input animation state
 * @param {HTMLElement} inputTxt - Text input
 */
function addFocus(inputTxt) {
    if (inputTxt.classList)
        inputTxt.classList.add('focused');
}

/**
 * Clear text input content
 * @param {HTMLElement} inputTxt - Text input
 */
function clearTxt(inputTxt) {
    inputTxt.value = '';
}

/**
 * Verify if a text input is empty
 * @param {HTMLElement} inputTxt - Text input
 * @returns {Boolean}
 */
function isInputTxtEmpty(inputTxt) {
    return inputTxt.value.length === 0;
}

/**
 * Execute a callback with delay
 * @param {Function} callback 
 * @param {Number} duration 
 */
function withDelay(callback, duration) {
    const timerID = setTimeout(() => {
        if (callback) {
            callback();
        }

        clearTimeout(timerID);
    }, duration);
}

/**
 * Add item to the to do list
 * @param {HTMLElement} toDoElement 
 * @param {Object} item
 * @returns {Number} Item's id
 */
function addToDoItem(toDoElement, { id, description }) {
    const itemID = id;
    const itemEl = document.createElement('div');
    itemEl.setAttribute('id', itemID);
    itemEl.classList.add('todo-item');

    const inputEl = document.createElement('input');
    inputEl.setAttribute('type', 'checkbox');
    inputEl.classList.add('input-check');
    inputEl.value = 'finished';

    const labelEl = document.createElement('label');
    labelEl.classList.add('todo-description');
    labelEl.setAttribute('for', itemID);
    labelEl.innerHTML = description;

    const btnEl = document.createElement('button');
    btnEl.setAttribute('type', 'button');
    btnEl.classList.add('btn');
    btnEl.classList.add('btn-delete-todo');
    btnEl.value = itemID;
    

    const iconEl = document.createElement('i');
    iconEl.classList.add('far');
    iconEl.classList.add('fa-trash-alt');

    btnEl.appendChild(iconEl);

    itemEl.appendChild(inputEl);
    itemEl.appendChild(labelEl);
    itemEl.appendChild(btnEl);

    toDoElement.appendChild(itemEl);

    return itemID;
}

/**
 * Remove item from the to do list
 * @param {HTMLElement} toDoElement 
 * @param {Number} itemID 
 * @param {Number} animationDelay 
 */
function removeToDoItem(toDoElement, itemID, animationDelay = DELETE_DELAY) {
    const itemEl = document.getElementById(itemID);
    itemEl.classList.add('deleted');

    remove(itemID);
 
    withDelay(() => {
        toDoElement.removeChild(itemEl);
    }, animationDelay);
}

/**
 * Toggle all item's checkboxes
 * @param {Event} e
 */
function toggleAllChecks(e) {
    const isChecked = e.target.checked;
    const allItems = document.querySelectorAll('.todo-item');
    
    allItems.forEach(item => {
        const inputEl = item.querySelector('.input-check');

        if (inputEl) {
            inputEl.checked = isChecked;
        }
    });
}

/**
 * Clear all items
 */
function onClearAll() {
    clearCache();

    const allItems = document.querySelectorAll('.todo-item');
    allItems.forEach((item, index) => {
        const itemID = item.getAttribute('id');
        removeToDoItem(toDo, itemID, DELETE_DELAY * index);
    });
}

/**
 * Handler for add item event
 */
function onAddItem() {
    const toDoInput = document.getElementById('todo-input');
    let description = toDoInput.value;

    if (description.length > 0) {
        let item = {
            id: Date.now().toString(),
            description
        };

        store(item);
        addToDoItem(toDo, item);
        clearTxt(toDoInput);
    }
}

document.addEventListener('click', function(e) {
    const parent  = e.target.parentNode;
    const parentClassList = parent.classList;

    if (parentClassList 
            && !parentClassList.contains('input-text-wrapper')) {
        inputTxtWrapper.forEach(removeFocus);
    } else {
        inputTxtWrapper.forEach(removeFocus);
        addFocus(parent);
    }
});

toDo.addEventListener('click', (e) => {
    const { target } = e;

    //Handle delete button on click

    if (target.tagName
            && target.tagName.toLowerCase() === 'button'
            && target.classList.contains('btn-delete-todo')) {
        const parent = target.parentNode;
        let itemID = parent.getAttribute('id');

        removeToDoItem(toDo, itemID);

        return;
    }

    if (target.tagName
            && target.tagName.toLowerCase() === 'i'
            && target.classList.contains('fa-trash-alt')) {
        const parent = target.parentNode;
        const itemEl = parent.parentNode;
        const itemID = itemEl.getAttribute('id');

        removeToDoItem(toDo, itemID);
    }
});

inputTxt.forEach(input => {
    const parent = input.parentNode;

    //Focus animation

    input.addEventListener('focus', () => {
        addFocus(parent);
    });

    //Blur animation

    input.addEventListener('blur', () => {
        removeFocus(parent)
    });

    //Handle ENTER key press

    input.addEventListener('keydown', (e) => {
        if (e.keyCode === VK_ENTER_SUBMIT) {
            btnAddToDo.click();
        }
    });
});

inputChkToggle.addEventListener('change', toggleAllChecks);
btnAddToDo.addEventListener('click', onAddItem);
btnClearAll.addEventListener('click', onClearAll);

loadCache();