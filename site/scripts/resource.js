window.addEventListener("load", init);

var input;
var request;
			
function init()
{
	document.querySelector("#results-wrap").style.display = "none";
	document.querySelector("#reserved-books").style.display = "none";
	document.querySelector("#resource-select").addEventListener("submit", submitSearch);
	
	hideResultsNav();
	checkBookStorage();
}

function checkBookStorage()
{
	// check if user has 'books' obj in storage
	if(!"books" in localStorage)
	{
		// if not, create one - empty (null)
		localStorage.setItem("books", "");
	}
	// show books for initial load
	showBooks();
}

function submitSearch(evt)
{
	// collect input value from search bar
	input = document.querySelector("#resource-search").value.trim();
	// intermediary function, simply used to preventDefault()
	evt.preventDefault();
	request = "GET";
	// proceed with db GET request
	getResource();
}

function getResource()
{
	// clear existing results - ready to replace
	var target = document.querySelector("#result");
	
	while(target.firstChild)
	{
		target.removeChild(target.lastChild);
	}
	
	// check for empty input - proceed if there is a string
	if(input.length > 0)
	{
		// append input string to api url - to be picked up by $_GET function at api
		var url = "api.php?input=" + input;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
		{
			if (xhttp.readyState === 4)
			{
				if(xhttp.status === 200)
				{
					// collect results from request
					jsonResults = JSON.parse(xhttp.responseText);
					// populate div with search results
					createResults(input);
					// update and show user's reserved books
					showBooks();
					
					// FOR PAGINATION
					// get length of results / to calculate number of pages
					results = parseInt(jsonResults.length);
					// create array of the html elements generated for results
					events = Array.prototype.slice.call(document.querySelectorAll(".result"));
					// set number of pages
					numberOfPages = getNumberOfPages();
					// show secondary navigation for pagination
					showResultsNav();
					// check which request type made this request, and process (pagination word-around)
					checkLoadList(request);
				}
				else if(xhttp.status === 204)
				{
					document.querySelector("#showing-for").textContent = "No results found for '" + input + "'";
					hideResultsNav();
				}
			}
		};
		// error checking feedback
		xhttp.onerror = function()
		{
			hideResultsNav();
			alert("Error - Please check your Connection");
			document.querySelector("#showing-for").textContent = "No connection found";
		}
		xhttp.open("GET", url, true);
		xhttp.send();
	}
	else
	{
		// show error if no string was input
		document.querySelector("#showing-for").textContent = "Please enter a word to search";
		hideResultsNav();
	}
	
	// make results div visible
	document.querySelector("#results-wrap").style.display = "block";
}

function createResults(input)
{
	// heading for results
	document.querySelector("#showing-for").textContent = "Showing results for: '" + input + "'";
	
	var length = jsonResults.length;
	var target = document.querySelector("#result");
	
	// pass JSON data to createDiv() function
	for(var i = 0; i <= length - 1; i++)
	{	
		target.appendChild(createDiv(jsonResults[i].title,
									jsonResults[i].author,
									jsonResults[i].descr,
									jsonResults[i].isbn,
									jsonResults[i].copies,
									jsonResults[i].avCopies,
									i));
	}
}

function createDiv(title, author, descr, isbn, copies, avCopies, num)
{
	// create container div
	var div = document.createElement("div");
	
	// create div child elements
	var hTitle = document.createElement("h1"); // title
	var hAuthor = document.createElement("h2"); // author
	var pDescr = document.createElement("p"); // description
	
	var divShow = document.createElement("div"); // purely to align the text in anchor below
	var aShow = document.createElement("a"); // 'show more' link
	
	// create div to hold 'more...' details
	var divMore = document.createElement("div");
	
	// create divMore child elements
	var pISBN = document.createElement("p"); // isbn number
	var pCopies = document.createElement("p"); // number of total copies 
	var pAvCopies = document.createElement("p"); // number of available copies
	var iReserve = document.createElement("input"); // reserve resource
	
	// set content for new elements - some using passed in params
	hTitle.textContent = title;			
	hAuthor.textContent = "by " + author;
	pDescr.textContent = "Description: " + descr;
	aShow.textContent = "More...";
	pISBN.textContent = "ISBN: " + isbn;	
	pCopies.textContent = "Number of copies: " + copies;
	pAvCopies.textContent = "Available copies: " + avCopies;
		
	// set attributes for some new elements - for toggle 'show-more' action
	divMore.style.display = "none"; // hide 'more...' div upon creation
	
	iReserve.setAttribute("class", "reserve");
	iReserve.setAttribute("value", "Reserve");
	iReserve.setAttribute("type", "button");
	divShow.setAttribute("class", "link"); // set div class to enable text-alignment of child anchor
	aShow.setAttribute("href", "#!"); // use anchor behaviour with no href
	aShow.setAttribute("onclick", "toggleMore(this)"); // set click event - to toggle div display
	divMore.setAttribute("class", "more"); // set class for styling
	
	if(num < 5)
	{
		div.setAttribute("class", "result"); // set class for styling
	}
	else
	{
		div.setAttribute("class", "result not-visible"); // set class for styling
	}
	
	// apply click function to button - to reserve a resource
	iReserve.addEventListener("click", reserveItem);
	
	// check if book is available to reserve
	if(avCopies < 1)
	{
		iReserve.setAttribute("disabled", "true");
		iReserve.style.backgroundColor = "#d8d8d8";
		iReserve.style.color = "#adabab";
	}
	
//CHECK IF BOOK IS ALREADY RESERVED BY USER

	// get 'books' obj in users storage
	var storedBooks = localStorage.getItem("books");
	if(storedBooks !== null) // if it has entries
	{
		// divide 'books' obj string into an array
		var booksList = storedBooks.split(",");
		// for each element in array
		for(var i = 0; i < booksList.length; i++)
		{
			// check if it matches this books isbn
			if(title === booksList[i])
			{
				// if so, disable the reserve button and style appropriately
				iReserve.setAttribute("disabled", "true");
				iReserve.setAttribute("value", "Reserved");
				divMore.style.backgroundColor = "#e6ffe0";
				iReserve.style.backgroundColor = "#d8d8d8";
				iReserve.style.color = "#adabab";
			}
		}
	}
	
	// append new elements to new div
	div.appendChild(hTitle);
	div.appendChild(hAuthor);
	div.appendChild(pDescr);
	divShow.appendChild(aShow);
	div.appendChild(divShow);
	divMore.appendChild(pISBN);
	divMore.appendChild(pCopies);
	divMore.appendChild(pAvCopies);
	divMore.appendChild(iReserve);
	div.appendChild(divMore);
	
	return div;	
}

// ADD TO USERS STORAGE
function reserveItem(evt)
{
	evt.preventDefault();
	// get the textContent belonging to the isbn <p> element in the same div as this button
	var title = this.parentElement.parentElement.children[0].textContent;
	var author = this.parentElement.parentElement.children[1].textContent.split("by "); // split after default string
	
	
	var bookData = [];
	bookData.push(title);
	bookData.push(author[1]);
	var bookDataString = bookData.toString();
	
	var storedBooks = localStorage.getItem("books");
	if(storedBooks === null)
	{
		// set as first entry
		localStorage.setItem("books", bookData);
	}
	else
	{
		var booksList = storedBooks.split(",");
		booksList.push(bookData);
		var newBooksList = booksList.toString();
		localStorage.setItem("books", newBooksList);
	}
	
// MODIFY NUMBER OF AVAILABLE COPIES ON RESOURCE DB

	// get the textContent belonging to elements in the same div as this button
	var avCopies = this.parentElement.children[2].textContent.split(": "); // split after 'Available copies: '
	var isbn = this.parentElement.children[0].textContent.split(": "); // split after 'ISBN: '
	// parse the avCopies string into an int
	var avCopiesInt = parseInt(avCopies[1]);
	// subtract 1 from avCopiesInt
	var newAvCopiesInt = avCopiesInt - 1;
	// stringify the newAvCopiesInt
	var newAvCopies = newAvCopiesInt.toString();

	// package isbn and newAvCopies together as the data to be posted
	var data = "isbn=" + encodeURIComponent(isbn[1])
		+ "&avCopies=" + encodeURIComponent(newAvCopies);

	var url = "api.php";
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if (xhttp.readyState === 4 && xhttp.status === 201)
		{
			// if successful, fetch the updated data from db
			request = "POST";
			getResource();
		}
	};
	// error checking feedback
    xhttp.onerror = function() { alert("Error - Please check your Connection"); }
	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(data);
}

// DBUG - CAN BE ADAPTED AND USED TO SHOW/REMOVE BOOKS
function clearStorage()
{
	localStorage.removeItem("books");
	var target = document.querySelector("#show-books");
	
	// clear current children first
	while(target.firstChild)
	{
		target.removeChild(target.lastChild);
	}
}

function showBooks()
{
	// clear current book list
	var target = document.querySelector("#show-books");
	while(target.firstChild)
	{
		target.removeChild(target.lastChild);
	}
	
	// collect book list from local storage
	var books = localStorage.getItem("books");
	
	if(books === null)
	{
		var p = document.createElement("p");
		p.textContent = "No books reserved or on loan";
		target.appendChild(p);
	}
	else
	{
		// split stored book list string - books are stored title,author,title,author...
		var storedBooks = books.split(",");
		
		for(var i = 0; i < storedBooks.length; i++)
		{
			// use modulo to discover if a number is odd or even (if there IS remainder from i/2 then i = odd)
			if(i % 2)
			{
				// for odd numbers (e.g. "every other loop count")
				var liTitle = document.createElement("li");
				var ul = document.createElement("ul");
				var liAuthor = document.createElement("li");
				
				liTitle.textContent = storedBooks[i-1]; // title = storedBooks[0]
				liAuthor.textContent = "by " + storedBooks[i]; // author = storedBooks[1]
				
				// append author item to author list
				ul.appendChild(liAuthor);
				// append author list to title item
				liTitle.appendChild(ul);
				// append title item to title list
				target.appendChild(liTitle);
			}
		}
	}
	document.querySelector("#show-books").style.display = "block";
}

// toggle more or less book information - to reserve
function toggleMore(a)
{
	var extra = a.parentNode.parentNode.lastChild;
	if(extra.style.display === "none")
	{
		extra.style.display = "block";
		a.textContent = "Less...";
	}
	else
	{
		extra.style.display = "none";
		a.textContent = "More...";
	}
}

// PAGINATION FUNCTIONALITY

var pageList = new Array();
var currentPage = 1;
var numberPerPage = 5;
var events = Array.prototype.slice.call(document.querySelectorAll(".result"));
var numberOfPages = getNumberOfPages();

var results;

function checkLoadList(r)
{
	if(r == "GET")
	{
		loadList();
	}
	else // if(r == "POST")
	{
		checkResultsNav();
		currentPage = 1;
		drawList(r);
		currentPage = 0;
	}
}

function getNumberOfPages()
{
  return Math.ceil(results / numberPerPage);
}

function nextPage()
{
	if(currentPage < (results/numberPerPage))
	{
		if(currentPage == 0)
		{
			currentPage +=2;
			var remove = document.querySelector("#result").children;
			
			for (i = 0; i < 5; i++)
			{
				remove[i].classList.add("not-visible");
			}
		}
		else
		{
			currentPage += 1;
		}
		loadList();
	}
}

function previousPage()
{
	currentPage -= 1;
	loadList();
}

function firstPage()
{
	currentPage = 1;
	loadList();
}

function lastPage()
{
	if(currentPage == 0)
	{
		currentPage +=2;
		var remove = document.querySelector("#result").children;
		
		for (i = 0; i < 5; i++)
		{
			remove[i].classList.add("not-visible");
		}
	}
	
	if(currentPage < numberOfPages)
	{
		currentPage = numberOfPages;
		loadList();
	}
}

function loadList()
{
	var g = "GET";
	var begin = ((currentPage - 1) * numberPerPage);
	var end = begin + numberPerPage;
	
	for (i = 0; i < pageList.length; i++)
	{
		pageList[i].classList.add("not-visible"); // make the old list invisible
	}
	
	pageList = events.slice(begin, end);
	drawList(g);
}

function drawList(rr)
{
	for (i = 0; i < pageList.length; i++)
	{
		pageList[i].classList.remove("not-visible"); // make the new list visible
	}
	checkResultsNav();
}

function checkResultsNav()
{
	// 'next' buttons
	var nextElements = document.querySelectorAll(".next");
	for(var i = 0; i < nextElements.length; i++)
	{
		// disable this button if - there are no next pages
		nextElements[i].disabled = currentPage == numberOfPages ? true : false;
		if(currentPage == numberOfPages)
		{
			// enforce appropriate styling
			nextElements[i].style.backgroundColor = "#d8d8d8";
			nextElements[i].style.color = "#adabab";
		}
		else
		{
			nextElements[i].style.backgroundColor = "#86b2f9";
			nextElements[i].style.color = "white";
		}
	}
	// 'previous' buttons
	var previousElements = document.querySelectorAll(".previous");
	for(var i = 0; i < previousElements.length; i++)
	{
		// disable this button if - there are no previous pages
		previousElements[i].disabled = currentPage == 1 ? true : false;
		if(currentPage == 1)
		{
			// enforce appropriate styling
			previousElements[i].style.backgroundColor = "#d8d8d8";
			previousElements[i].style.color = "#adabab";
		}
		else
		{
			previousElements[i].style.backgroundColor = "#86b2f9";
			previousElements[i].style.color = "white";
		}
	}
	// 'first' buttons
	var firstElements = document.querySelectorAll(".first");
	for(var i = 0; i < firstElements.length; i++)
	{
		// disable this button if - already on first page
		firstElements[i].disabled = currentPage == 1 ? true : false;
		if(currentPage == 1)
		{
			// enforce appropriate styling
			firstElements[i].style.backgroundColor = "#d8d8d8";
			firstElements[i].style.color = "#adabab";
		}
		else
		{
			firstElements[i].style.backgroundColor = "#86b2f9";
			firstElements[i].style.color = "white";
		}
	}
	// 'last' buttons
	var lastElements = document.querySelectorAll(".last");
	for(var i = 0; i < lastElements.length; i++)
	{
		// disable this button if - already on last page
		lastElements[i].disabled = currentPage == numberOfPages ? true : false;
		if(currentPage == numberOfPages)
		{
			lastElements[i].style.backgroundColor = "#d8d8d8";
			lastElements[i].style.color = "#adabab";
		}
		else
		{
			lastElements[i].style.backgroundColor = "#86b2f9";
			lastElements[i].style.color = "white";
		}
	}
}

// TOGGLE FUNCTIONS
function showResultsNav()
{
	var resultNavElements = document.querySelectorAll(".results-nav");
	for(var i = 0; i < resultNavElements.length; i++)
	{
		resultNavElements[i].style.display = "block";
	}
}

function hideResultsNav()
{
	var resultNavElements = document.querySelectorAll(".results-nav");
	for(var i = 0; i < resultNavElements.length; i++)
	{
		resultNavElements[i].style.display = "none";
	}
}
			
function toggleReserved()
{
	var yourResources = document.querySelector("#reserved-books");
	
	if(yourResources.style.display == "none")
	{
		document.querySelector("#reserved-books").style.display = "block";
		document.querySelector("#show-reserved").value = "Hide";
	}
	else
	{
		document.querySelector("#reserved-books").style.display = "none";
		document.querySelector("#show-reserved").value = "Show";
	}
}