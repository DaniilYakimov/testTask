const urlUsers = "https://json.medrating.org/users/"
const urlAlbums = "https://json.medrating.org/albums"
const urlPhotos = "https://json.medrating.org/photos"
const urlPreload = "img/loader.gif";
const urlErrorImg = "img/error.png";
const urlEmptyImg = "img/empty.png";


/**
 * @description Вспомогательный класс для создания html-списка (ul).
 */
class List {
	/**
	 * Создаёт экземпляр List.
	 * @constructor
	 * @this {List}
	 * @param {string} name - имя класса списка.
	 * 
	 * @property {string} listName - Название класса списка(ul).
	 * @property {string} id - ID списка (ul).
	 * @property {string[]} classList - Дополнительные классы списка(ul).
	 * @property {string[]} classItem - Дополнительные классы элементов(li) списка(ul).
	 * @property {boolean} waitAllLoad - Ожидается ли использование Promise для каждого элемента(li).
	 * @property {boolean} extraBlock - Нужно ли добавить информационный блок.
	 *     Например, может содержать информацию о проблемах с соединением.
	 * @property {Object<Object<Function [, string]>>} funcs - Содержит объекты с функциями,
	 *     которые применяются при создании каждого элемента(li).
	 * @see f1 - пример объекта, который может быть добавлен в List.funcs.
	 * @property {Object<Promise[], Function, Function>} promise - Содержит массив и две функции, первая выполнятся
	 *     для каждого элемента(li) и возвращает Promise, вторая получает массив Promise, обрабатывая
	 *     событие, когда либо все Promise успешно выполнены, либо нет.
	 * @property {Number} funcsCount - использует для подсчёта добавленных объектов в funcs,
	 *     а также для именования этих самых обхектов.
	 * @property {Object<string>} someListId - объект, содержащий названия id, которые используется для
	 *     заполнения вкладки Избранного при загрузке страницы, а также для сохранения id добавленных
	 *     изображений при закрытии страницы.
 */
	constructor(name) {
		this.listName = `list__${name}s`;
		this.id = `${name}Id`;
		this.classList = ["_hidden"];
		this.classItem = [];
		this.waitAllLoad = false;
		this.extraBlock = false;
		this.funcs = {};
		this.promise = undefined;
		this.funcsCount = 0;
		this.someListId = {};
		this.someListIdLength = 0;
	}

	/**
	 * @param {string[]} classNames  - массив с названиями добавляемых классов.
	 * @param {string} attrName - имя свойства, к которому добавляются имена классов.
	 * @description Добавляет классы к выбранному свойству (List.classList или List.classItem).
	 */
	addClass(classNames, attrName) {
		for (let i = 0; i < classNames.length; i++) {
			this[attrName].push(classNames[i]);
		}
	}

	/**
	 * @param {string} classNames - название добавляемого класса.
	 * @description Добавляет название классов в свойство List.classList.
	 *     Может быть передано несколько параметров типа string.
	 */
	addClassList(classNames) {
		this.addClass(arguments, "classList");
	}

	/**
	 * @param {string} classNames - название добавляемого класса.
	 * @description Добавляет название классов в свойство List.classItem.
	 *     Может быть передано несколько параметров типа string.
	 */
	addClassItem(classNames) {
		this.addClass(arguments, "classItem");
	}

	/**
	 * @param {Object} funcObj
	 * @param {Function} funcObj.func - функция.
	 * @param {string} funcObj.attr - имя свойства, значения которого нужно получить из объекта с данными.
	 * @see f1 - пример объекта funcObj.
	 * @description Добавляет объект в List.funcs.
	 *     Может быть передано несколько параметров типа Object<Function [, string]>.
	 * @example Пример объекта, который List.funcs может содержать.
	 * funcs{
	 * 	funcObj : {
	 * 		func: {function} funcName,
	 * 		[attr: {String} attrName,] - не обязятельное свойство
	 * 	} 
	 * }
	 * funcObj - любое название объекта.
	 * funcName - имя функции.
	 * attr - не обязятельное свойство,
	 * attrName - имя свойства, значение которого мы хотим получить от объекта с данными.
	 * При вызове функции первым параметром передаётся значения свойства с именем attrName
	 * объекта с данными, вторым - сам элемент(li).
	 * Если свойство attr не указано, то в функцию передаётся только сам элемент(li). 
	 */
	addFunction(funcObj) {
		for (let i = 0; i < arguments.length; i++) {
			this.funcsCount++;
			this.funcs[`f${this.funcsCount}`] = {};
			for (let attr in arguments[i]) {
				this.funcs[`f${this.funcsCount}`][attr] = arguments[i][attr];
			}
		}
	}

	/**
	 * @param {string} id - добавляемое id.
	 * @description Добавляет id в объект List.someListId.
	 *     Может быть передано несколько параметров типа string.
	 */
	addSomeListId(id) {
		for (let i = 0; i < arguments.length; i++){
			let itID = arguments[i];
			itID = itID.slice(itID.indexOf(this.id + 1));
			this.someListId[arguments[i]] = itID;
			this.someListIdLength++;
			
		}
	}

	/**
	 * 
	 * @returns Возвращает размер List.someListId.
	 */
	getSizeSomeListId(){
		return this.someListIdLength;
	}

	/**
	 * @param {string} id - удаляемое id.
	 * @description Удаляет id из объекта List.someListId.
	 *     Может быть передано несколько параметров типа string.
	 */
	removeSomeListId(id){
		for (let i = 0; i < arguments.length; i++){
			delete this.someListId[arguments[i]];
			this.someListIdLength--;
		}		
	}

	/**
	 * @param {Function} funcItem - функция, возвращающая Promise. Вызывается для каждого элемента(li).
	 * @see imgLoaded - пример функции funcItem.
	 * @param {Function} funcPromise - функция, получающая массив с Promise. Выполняет действия, после  завершения всех Promise. 
	 * @see waitAllPromises - пример функции funcPromise.
	 * @property {Promise[]} List.promise.arr - массив, в который добавляются полученные Promise от funcItem.
	 * @description Инициализирует List.promise.
	 */
	setPromise(funcItem, funcPromise) {
		this.promise = {
			arr: [],
			funcItem: funcItem,
			funcPromise: funcPromise,
		}
	}

	createUrlSomeListId(){
		let url = "";
		for (let id in this.someListId){
			url += `id=${this.someListId[id]}&`;
		}
		return url;
	}
}


/** @description Объект для добавления в List.funcs*/
const f1 = {
	func: createItemTitle,
	attr: "name"
};
const f2 = {
	func: addThumbnailPhoto,
	attr: "thumbnailUrl",
};
const f3 = {
	func: createSimpleTitle,
	attr: "title"
};

/**@description Экземпляр класса List для создания списка пользователей.*/
const paramsUser = new List("user");
paramsUser.extraBlock = true;
paramsUser.addFunction(f1);

/** @description Экземпляр класса List для создания списка альбомов пользователей.*/
const paramsAlbum = new List("album");
paramsAlbum.extraBlock = true;
f1.attr = "title";
paramsAlbum.addFunction(f1);

/** @description Экземпляр класса List для создания списка фотографий альбомов.*/
const paramsPhoto = new List("photo");
paramsPhoto.waitAllLoad = true;
paramsPhoto.addClassItem("photo");
paramsPhoto.addFunction(f2, f3);
paramsPhoto.setPromise(
	(elem) => imgLoaded(elem.querySelector(".thumbnail-photo")),
	waitAllPromises
);

const favoritePrefix ="fav_";

const tabsCatalog = document.querySelector(".tabs__catalog");
const tabsFavorite = document.querySelector(".tabs__favorite");
const contentTabs = document.querySelector(".content__tabs");
const tabsMenu = document.querySelector(".tabs__menu");
const tabsItems = tabsMenu.querySelectorAll(".tabs__item");
const tabsBlocks = document.querySelectorAll(".tabs__block");
const popup = document.querySelector(".popup");

contentTabs.addEventListener("click", clickOnContentTabs, false);
tabsCatalog.addEventListener("mousemove", mouseMoveContentTabs, false)
tabsMenu.addEventListener("click", clickOnTabsMenu, false);
popup.addEventListener("click", clickOnPopup);

window.addEventListener("beforeunload", function (event) {
	localStorage.setItem("favoriteListId", JSON.stringify(paramsPhoto.someListId));
});


addList(urlUsers, tabsCatalog, paramsUser);


if (localStorage.getItem("favoriteListId") != null) {
	const parseListId = JSON.parse(localStorage.getItem("favoriteListId"));
	console.log(parseListId);
	for (let key in parseListId) {
		paramsPhoto.addSomeListId(key);
	}
}

/** 
 * @param {*} event - событие клика по вкладкам.
 * @returns
 * @description Обрабатывает событие клика по какой-либо вкладке.
 *     Если кликнули активную вкладку, ничего не происходит, в противном
 *     случае кликнутая вкладка становится активной. Если выбрана вкладка
 *     "Избранное", то в неё начинают загружатся все избранные фото
 *     (если таковы имеются). 
 */
function clickOnTabsMenu(event) {
	if (event.target.closest(".tabs__item")) {
		const tabsItem = event.target.closest(".tabs__item");
		if (tabsItem.classList.contains("_active")) {
			return;
		}

		for (let i = 0; i < tabsItems.length; i++) {
			tabsItems[i].classList.remove("_active");
		}
		tabsItem.classList.add("_active");
		const idTargetTab = tabsItem.id;

		for (let i = 0; i < tabsBlocks.length; i++) {
			tabsBlocks[i].classList.add("_hidden");
		}

		const tabs = document.querySelector(`.tabs__block.${idTargetTab}`);
		tabs.classList.remove("_hidden");

		if (tabs.classList.contains("tabs__favorite")	&&
			!tabsFavorite.classList.contains("_added-list")
		) {
			addList(urlPhotos, tabsFavorite, paramsPhoto, true);
		}
	}
}

/**
 * 
 * @param {*} event - событие клика по содержимому вкладок.
 * @returns
 * @description Обрабатывает событие клика по содержимому вкладок.
 *     Если кликнута кнопка элемента списка, то в него добавляется
 *     соответствующий список альбомов/фото.
 *     Если кликнута звёздочка на фото, то добавляем/убираем его.
 *     Если само фото, то выводим попам с полноразмерным фото. 
 */
function clickOnContentTabs(event) {
	if (event.target.closest("li .dropdown-btn")) {
		const btn = event.target.closest(".dropdown-btn");
		btn.classList.toggle("_active");
		const listItem = btn.closest("li");
		listItem.classList.toggle("_active");


		if (listItem.classList.contains("_added-list") ||
			!listItem.classList.contains("_active")
		) {
			return;
		}

		if (btn.closest(".list__albums-item")) {
			addList(urlPhotos, listItem, paramsPhoto);
		}
		else if (btn.closest(".list__users-item")) {
			addList(urlAlbums, listItem, paramsAlbum)
		}
	}
	else if (event.target.closest(".star")) {

		const itemPhoto = event.target.closest(".list__photos-item");
		itemPhoto.classList.toggle("_active");
		if (itemPhoto.classList.contains("_active")) {
			addFavoriteImg(itemPhoto, paramsPhoto);
		}
		else {
			removeFavoriteImg(itemPhoto, paramsPhoto);
		}
	}
	else if (event.target.closest(".thumbnail-photo")) {
		showPopupImg(event.target.closest(".list__photos-item"));
	}
}

/** 
 * @param {*} event - событие клика по попапу.
 * @description Обрабатывает событие клика по попапу.
 *     Если кликнули по крестику или по фону попапа(не фото), то закрываем попап.
 *     Также убираем отступ справа для body.
 */
function clickOnPopup(event) {
	if (event.target.closest(".popup__close") ||
		!event.target.closest(".popup__img")
	) {
		popup.classList.remove("_active");
		document.body.style.overflow = "";
		document.body.style.paddingRight = "";
		const popupImg = popup.querySelector(".popup__img");
		popupImg.classList.add("_hidden");
	}
}

/**
 * 
 * @param {*} event - событие движения курсора по содержимому вкладок.
 * @description Обрабатывает событие движения курсора по содержимому вкладок.
 *     Если курсор попадает в область фото, то под курсором появляется описание фото.
 *     Описание двигается вместе с курсором и исчезает, как только курсор покидает фото.
 */
function mouseMoveContentTabs(event) {
	if (event.target.closest(".photo")) {
		const photo = event.target.closest(".photo");
		let photoRect = photo.querySelector(".thumbnail-photo").getBoundingClientRect();
		const X = event.clientX;
		const Y = event.clientY;
		if (X >= photoRect.left - 2 &&
			X <= photoRect.left + photoRect.width + 2 &&
			Y >= photoRect.top - 2 &&
			Y <= photoRect.top + photoRect.height + 2
		){
			const title = event.target.closest(".photo").querySelector(".list__item-title");
			title.style.left = (X - photoRect.left) + "px";
			title.style.top = (Y - photoRect.top + 24) + "px";
		}
		if (event.target.closest("img")) {
			
		}
	}
}

/**
 * @param {*} elem - фото, которое нужно показать в полном размере.
 * @description Выводит полноэкранный попап с полноразмерным фото.
 *     Скрывает скролл body и добавляет body отступ справа,
 *     равный ширине вертикального скролла (если он есть).
 *     Создаёт запрос по url, где id фото = id переданного элемента,
 *     загружает данные и добавляет соответствующее фото в попап.
 *     В случае неудачной загрузки выводит соответствующую информацию.
 */
function showPopupImg(elem) {
	document.body.style.paddingRight = (window.innerWidth - document.body.offsetWidth) + "px";
	document.body.style.overflow = "hidden";

	const popupWrapper = popup.querySelector(".popup__wrapper");
	const popupImg = popup.querySelector(".popup__img");
	popup.classList.add("_active");
	const imgId = elem.id.indexOf(paramsPhoto.id) > -1 ?
		elem.id.slice(paramsPhoto.id.length + 1) :
		elem.id;
	
	getDataJSON(`${urlPhotos}?id=${imgId}`, popupWrapper)
	.then(response => {
		if (response == null) {
			errorLoad(popupWrapper);
		}
		popupImg.src = response[0].url;
		const imgPromise = imgLoaded(popupImg);
		waitAllPromises([imgPromise], popupWrapper, popupImg, false, 0);
	}, reject => {
		errorLoad(popupWrapper);
		console.log(reject);
	});
}

/**
 * @param {*} elem - фото, которое добавляется в избранное.
 * @param {List} params - класс List.
 * @description Добавляет выбранное фото (кликнули по его звёздочке)
 *     в избранное, а его id в params.someListId. Если список пуст, то
 *     вызываем notEmptyFavoriteTabs().
 *     Сбрасываем стили у описания фото.
 */
function addFavoriteImg(elem, params) {
	const listPhotos = tabsFavorite.querySelector(".list__photos");
	if (params.getSizeSomeListId() === 0) {
		notEmptyFavoriteTabs();
	}
	params.addSomeListId(elem.id);
	if (listPhotos == null){
		return;
	}
	const child = elem.cloneNode(true);
	child.id = favoritePrefix + child.id;
	listPhotos.appendChild(child);
}

/**
 * @param {*} elem  - фото, которое удаляется из избранного.
 * @param {List} params  - класс List.
 * @description Удаляет выбранное фото (кликнули по его звёздочке)
 *     из избранного, а его id из params.someListId. Меняем у фото
 *     с нужным id во вкладе Каталог жёлтую звёздочку на серую.
 *     Если список стал пустым, то вызываем emptyFavoriteTabs().
 */
function removeFavoriteImg(elem, params) {
	let elemId= elem.id;
	if (elem.id.indexOf(favoritePrefix) > -1) {
		elemId = elem.id.slice(favoritePrefix.length);
	}
	
	const photoCat = document.getElementById(`${elemId}`);
	if (photoCat != null) {
		photoCat.classList.remove("_active");
	}

	const listPhotos = tabsFavorite.querySelector(".list__photos");
	const photoFav = document.getElementById(favoritePrefix + elemId);

	if (photoFav != null && listPhotos != null) {
		listPhotos.removeChild(photoFav);
	}

	params.removeSomeListId(elemId);
	if (params.getSizeSomeListId() === 0) {
		emptyFavoriteTabs();
	}
}

/**
 * @description Скрывает информационный блок ("extra-block") и
 *     показывает список фото.
 */
function notEmptyFavoriteTabs() {
	const listPhotos = tabsFavorite.querySelector(".list__photos");
	const extraBlock = tabsFavorite.querySelector(".extra-block");
	if (listPhotos != null) {
		listPhotos.classList.remove("_hidden");
	}
	if (extraBlock != null) {
		extraBlock.classList.add("_hidden");
	}
}

/**
 * @description Скрывает список фото и показывает информационный
 *     блок (extra-block), добавляя в него блок с сообщением (msg-block),
 *     перед этим удаляет (если есть) предыдущий блок с сообщением.
 */
function emptyFavoriteTabs() {
	const listPhotos = tabsFavorite.querySelector(".list__photos");
	const extraBlock = tabsFavorite.querySelector(".extra-block");
	if (listPhotos != null) {
		listPhotos.classList.add("_hidden");
	}
	if (extraBlock == null) {
		extraBlock = document.createElement("div");
		extraBlock.classList.add("extra-block");
	}
	const msgBlock = extraBlock.querySelector(".msg-block");
	if (msgBlock != null) {
		extraBlock.removeChild(msgBlock);
	}
	extraBlock.appendChild(createMsgBlock(
		urlEmptyImg,
		"Список избранного пуст",
		"Добавляйте изображения, нажимая на звездочки"
	));
	extraBlock.classList.remove("_hidden");
}

/**
 * @param {string} url - адресс данных. 
 * @param {*} elem - элемент, для которого загружаются данные.
 * @returns
 * @description Загружает данные с переданного url, добавляя
 *     информационный блок, а в него блок с картинкой ожидания загрузки.
 *     В случае успешной загрузки возвращает загруженные данные,
 *     иначе выводит блок с сообщением (msg-block).
 */
function getDataJSON(url, elem) {
	return new Promise(function (resolve, reject) {
		const extraBlock = elem.querySelector(".extra-block");
		let request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = 'json';
		request.timeout = 30000;
		request.ontimeout = reject;
		request.onload = function () {
			if (this.status === 200) {
				if (elem.classList.contains("_added-msg")) {
					elem.classList.remove("_added-msg");
					if (extraBlock != null) {
						extraBlock.removeChild(elem.querySelector(".msg-block"));
					}
				}
				resolve(this.response);
			}
			else {
				let error = new Error(this.statusText);
				error.code = this.status;
				reject(error);
			}
		}

		request.onloadstart = function () {
			if (extraBlock == null) {
				return;
			}
			extraBlock.classList.remove("_hidden");
			if (!extraBlock.querySelector(".preload")) {
				const preload = createPreloadImg(urlPreload);
				extraBlock.appendChild(preload);
			}
			if (extraBlock.querySelector(".msg-block")) {
				extraBlock.querySelector(".msg-block").classList.add("_hidden");
			}
		}

		request.onerror = reject;
		request.send();
	});
}

/**
 * @param {string} url - адрес загрузки данных.
 * @param {*} parent - элемент, к которому добавляются данные.
 * @param {List} params - параметра типа List.
 * @param {boolean} useListId - указывает, БУДУТ ли элементы взяты
 *     только с id, указаннами в params.someListId.
 * @description Выполняет запрос по url, в случае успешной загрузки
 *     создаёт список по полученным данным. Иначе, выводит информацию
 *     с ошибкой.
 */
function addList(url, parent, params, useListId = false) {
	if (useListId) {
		if (params.getSizeSomeListId() === 0) {
			if (parent.classList.contains("tabs__favorite")){
				emptyFavoriteTabs();
				createList({}, parent, params, useListId);
			}
			return;
		}
		url += "?" + params.createUrlSomeListId();
		
	} else {
		url += parent.id ? `?${parent.id}` : "";
	}

	getDataJSON(url, parent).then(response => {

		createList(response, parent, params, useListId);
	}, reject => {
		errorLoad(parent);
		console.log(reject);
	});
}

function addListFavorite(parent, params){

}

/**
 * @param {object} listData - загруженные данные.
 * @param {*} parent - элемент, куда добавляется список.
 * @param {List} params - параметра типа List.
 * @param {boolean} useListId - указывает, БЫЛИ ли элементы взяты
 *     только с id, указаннами в params.someListId.
 * @description Создаёт список(ul) с использованием params,
 *     применяя к создаваемым элементам(li) этого списка функции
 *     указанные в params.funcs, а также добавляя к элементам.
 */
function createList(listData, parent, params, useListId) {
	const list = document.createElement("ul");
	list.classList.add(`${params.listName}`);
	
	for (let i in params.classList) {
		list.classList.add(`${params.classList[i]}`);
	}
	
	parent.appendChild(list);
	parent.classList.add(`_added-list`);
	let listPromise = params.promise;
	const isFavoriteTab = parent.classList.contains("tabs__favorite");
	for (let i = 0; i < listData.length; i++) {
		const item = document.createElement("li");
		list.appendChild(item);
		item.id += `${params.id}=${listData[i]["id"]}`;
		
		item.classList.add(`${params.listName}-item`);
		for (let i in params.classItem) {
			item.classList.add(`${params.classItem[i]}`);
		}

		for (let f in params.funcs) {
			const func = params.funcs[f];
			func.attr == null ?
				func.func(item) :
				func.func(listData[i][func.attr], item);
		}

		if (isFavoriteTab){
			item.id = favoritePrefix + item.id;
			if (item.classList.contains("photo")){
				item.classList.add("_active");
			}
		}
		if (params.getSizeSomeListId() > 0 && item.id in params.someListId){
			item.classList.add("_active");
		}

		if (listPromise != null) {
			listPromise.arr.push(listPromise.funcItem(item));
		}

		if (!params.extraBlock) {
			continue;
		}
		const extraBlock = document.createElement("div");
		extraBlock.classList.add("extra-block", "_hidden");
		item.appendChild(extraBlock);
	}

	if (listPromise != null) {
		parent.querySelector(".extra-block").classList.remove("_hidden");
		listPromise.funcPromise(
			listPromise.arr,
			parent,
			list,
			useListId,
			params.getSizeSomeListId(),
		);
	} else {
		const extraBlockParent = parent.querySelector(".extra-block");
		extraBlockParent.classList.add("_hidden");
		const preload = extraBlockParent.querySelector(".preload");
		if (preload != null){
			extraBlockParent.removeChild(preload);
		}
		parent.querySelector(`.${params["listName"]}`).classList.remove("_hidden");
	}
}

/**
 * @param {Promise[]} arr - массив Promise
 * @param {*} parent - родитель элемента elem.
 * @param {*} elem - список(ul).
 * @param {*} useListId - указывает, БЫЛИ ли элементы взяты
 *     только с id, указаннами в params.someListId.
 * @param {Number} someListIdLength - размер List.someListId.
 * @description Ожидает выполнения всех Promise, переданных в arr.
 *     В случае успешного выполнения скрывает информационный блок и
 *     удаляет из него блок с картинкой ожидания загрузки.
 *     Иначе, выводит блок с сообщением. 
 */
function waitAllPromises(arr, parent, elem, useListId, someListIdLength) {

	Promise.all(arr).then(function () {
		const extraBlock = parent.querySelector(".extra-block");
		if (extraBlock != null){
			extraBlock.classList.add("_hidden");
			if (extraBlock.querySelector(".preload") != null){
				extraBlock.removeChild(extraBlock.querySelector(".preload"));
			}
		}
		elem.classList.remove("_hidden");
		if (useListId) {
			if (someListIdLength === 0 &&
				(parent.classList.contains("tabs__favorite"))
			) {
				emptyFavoriteTabs();
			}
		}

	}).catch(function (err) {
		errorLoad(parent);
		console.log(err);
	});
}

/**
 * @param {string} imgSource - url картинки.
 * @param {*} parent - элемент, в который добавляется картинка.
 * @description Добавляет указанному элементу картинку с указанным url,
 *     звёздочки и описание картинки.
 * 
 */
function addThumbnailPhoto(imgSource, parent) {
	const itemPhoto = document.createElement("img");
	itemPhoto.classList.add("thumbnail-photo");
	itemPhoto.src = imgSource;

	const starActive = document.createElement("img");
	starActive.classList.add("star-active", "star");
	starActive.src = "img/star_active.png";

	const starEmpty = document.createElement("img");
	starEmpty.classList.add("star-empty", "star");
	starEmpty.src = "img/star_empty.png";

	const itemTitle = document.createElement("span");
	itemTitle.classList.add("photo__title");


	parent.appendChild(itemPhoto);
	parent.appendChild(starActive);
	parent.appendChild(starEmpty);
}

/**
 * @param {*} parent 
 * @returns 
 * @description Выводит блок с сообщением в информационный блок
 *     указанного элемента.
 */
function errorLoad(parent) {
	const extraBlock = parent.querySelector(".extra-block");

	if (parent.querySelector(".preload")) {
		extraBlock.removeChild(parent.querySelector(".preload"));
	}
	if (parent.classList.contains("_added-msg")) {
		parent.querySelector(".msg-block").classList.remove("_hidden");
		return;
	}

	extraBlock.appendChild(createMsgBlock(
		urlErrorImg,
		"Сервер не отвечает",
		"Уже работает над этим"
	));
	parent.classList.add("_added-msg");
}

/**
 * @param {*} elem - элемент для которого выполняется Promise/
 * @returns Возвращает resolve, в случае успешной загрузки содержимого elem.
 * @description Выполняет Promise для указанного элемента.
 */
function imgLoaded(elem) {
	return new Promise(function (resolve, reject) {
		elem.onload = function () {
			resolve();
		}
		elem.onerror = reject;
	});
}

/**
 * @param {string} titleText - описание title.
 * @param {*} parent - элемент, в который добавляется title.
 * @description Создаёт элемент title лишь с одним текстом.
 */
function createSimpleTitle(titleText, parent) {
	const itemTitle = document.createElement("div");
	itemTitle.classList.add("list__item-title");

	const title = document.createElement("p");
	title.classList.add("title");
	title.textContent = titleText;

	itemTitle.appendChild(title);
	parent.appendChild(itemTitle);
}

/**
 * @param {*} titleText  - описание title.
 * @param {*} parent - элемент, в который добавляется title.
 * @description Создаёт элемент title с одним текстом и кнопкой.
 */
function createItemTitle(titleText, parent) {
	createSimpleTitle(titleText, parent);
	const itemTitle = parent.querySelector(".list__item-title");
	const dropdownBtn = document.createElement("span");
	dropdownBtn.classList.add("dropdown-btn");
	itemTitle.appendChild(dropdownBtn);
}

/**
 * @param {string} srcImg - url картинки.
 * @returns Блок с картинкой ожидания загрузки.
 * @description Создаёт и возвращает блок с картинкой ожидания загрузки.
 */
function createPreloadImg(srcImg) {
	const preload = document.createElement("div");
	preload.classList.add("preload");
	const preloadImg = document.createElement("img");
	preloadImg.src = srcImg;
	preloadImg.classList.add("preload__img");
	preload.appendChild(preloadImg);

	return preload;
}

/**
 * 
 * @param {string} srcImg  - url картинки.
 * @param {string} title - заголовок элемента.
 * @param {string} description - описание элмента.
 * @returns Блок с сообщением.
 * @description Создаёт блок с собщением по заданным заголовку,
 *     описанию и url картинки.
 */
function createMsgBlock(srcImg, title, description) {
	const msgBlock = document.createElement("div");
	msgBlock.classList.add("msg-block");

	const msgImg = document.createElement("img");
	msgImg.src = srcImg;
	msgImg.classList.add("msg__img");

	const msgText = document.createElement("div");
	msgText.classList.add("msg__text");
	const msgTitle = document.createElement("p");
	msgTitle.classList.add("msg__title");
	msgTitle.textContent = title;
	const msgDescription = document.createElement("p");
	msgDescription.classList.add("msg__description");
	msgDescription.textContent = description;

	msgText.appendChild(msgTitle);
	msgText.appendChild(msgDescription);

	msgBlock.appendChild(msgImg);
	msgBlock.appendChild(msgText);

	return msgBlock;
}