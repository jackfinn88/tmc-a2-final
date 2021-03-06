window.addEventListener("load", init);
			
function init()
{
	document.querySelector("#results-wrap").style.display = "none";
	document.querySelector("#room-select").addEventListener("submit", getJsonFromInput);
}

// JavaScript QRCode reader - 2011 Lazar Laszlo
function openQRCamera(node)
{
	var reader = new FileReader();
	reader.onload = function()
	{
		node.value = "";
		qrcode.callback = function(res)
		{
			if(res instanceof Error)
			{
				alert("No QR code found. Please make sure the QR code is within the camera's frame and try again.");
			}
			else
			{
				// pull data from scan result and process
				getJson(res);
			}
		};
		qrcode.decode(reader.result);
	};
	reader.readAsDataURL(node.files[0]);
}

function getJson(room)
{	
	// append scan result to api url - to be picked up by $_GET function at api
	var url = "api.php?id=" + room;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if (xhttp.readyState === 4)
		{
			
			if(xhttp.status === 200)
			{
				document.querySelector("#showing-for").textContent = "Timetable for Room: '" + room + "'";
				
				// collect results from request
				jsonResults = JSON.parse(xhttp.responseText);
				// populate table with search results
				fillTable();
				getSoftware(jsonResults[0].suite);
			}
			else if(xhttp.status === 204)
			{
				document.querySelector("#showing-for").textContent = "No results found for '" + room + "'";
				
				// clear previous search results
				var target = document.querySelector("#result");
				while(target.firstChild)
				{
					target.removeChild(target.lastChild);
				}
				// hide the last software list before this error
				document.querySelector("#software-list").style.display = "none";
			}
		}
	};
	// error checking feedback
    xhttp.onerror = function() { alert("Error - Please check your Connection"); }
	xhttp.open("GET", url, true);
	xhttp.send();
	
	document.querySelector("#results-wrap").style.display = "block";
}

function getJsonFromInput(evt)
{
	// intermediary function, simply used to preventDefault()
	evt.preventDefault();
	
	// proceed with db GET request
	var room = document.querySelector("#room-search").value.trim();
	if(room.length > 0)
	{
		getJson(room);
	}
	else
	{
		document.querySelector("#showing-for").textContent = "Please enter a room to search";
		document.querySelector("#results-wrap").style.display = "block";
		document.querySelector("#result").style.display = "none";
		document.querySelector("#software-list").style.display = "none";
	}
}

function fillTable()
{
	// <th> tags are removed by clearing results - reconstruct for each request
	createHeadRow();
	
	var target = document.querySelector("#result");	
	// pass JSON data to createRow() function
	for(var i = 0; i < jsonResults.length; i++)
	{	
		target.appendChild(createRow(jsonResults[i].day,
									jsonResults[i].hr1,
									jsonResults[i].hr2,
									jsonResults[i].hr3,
									jsonResults[i].hr4,
									jsonResults[i].hr5,
									jsonResults[i].hr6,
									jsonResults[i].hr7,
									jsonResults[i].hr8));
	}
	// clear input
	document.querySelector("#room-search").value = "";
}

function getSoftware(type)
{
	// clear the last software list
	var target = document.querySelector("#software");
	while(target.firstChild)
	{
		target.removeChild(target.lastChild);
	}
	
	// create elements for each software item (each room currently consists of only 5 notable softwares)
	var software1 = document.createElement("li");
	var software2 = document.createElement("li");
	var software3 = document.createElement("li");
	var software4 = document.createElement("li");
	var software5 = document.createElement("li");
	
	// modify text content depending on suite from JSON
	switch (type) {
		case "comp":
			software1.textContent = "Visual Studio";
			software2.textContent = "Android Studio";
			software3.textContent = "Notepad++";
			software4.textContent = "Microsoft SQL Server";
			software5.textContent = "BlueJ";
			break;
		case "design":
			software1.textContent = "Unity";
			software2.textContent = "Autodesk Maya";
			software3.textContent = "Photoshop CC";
			software4.textContent = "Unreal Engine";
			software5.textContent = "After Effects";
			break;
		case "engin":
			software1.textContent = "Audacity";
			software2.textContent = "Premiere Pro";
			software3.textContent = "AutoCAD";
			software4.textContent = "Java";
			software5.textContent = "Flash";
	}
	
	// append list items to software list
	target.appendChild(software1);
	target.appendChild(software2);
	target.appendChild(software3);
	target.appendChild(software4);
	target.appendChild(software5);
	
	// display software list
	document.querySelector("#software-list").style.display = "block";
}

function createHeadRow()
{
	// clear last results
	var target = document.querySelector("#result");
	while(target.firstChild)
	{
		target.removeChild(target.lastChild);
	}
	
	// create row
	var trHead = document.createElement("tr"); 
	
	// create cells
	var thDayHead = document.createElement("th");
	var thHr1Head = document.createElement("th");
	var thHr2Head = document.createElement("th");
	var thHr3Head = document.createElement("th");
	var thHr4Head = document.createElement("th");
	var thHr5Head = document.createElement("th");
	var thHr6Head = document.createElement("th");
	var thHr7Head = document.createElement("th");
	var thHr8Head = document.createElement("th");
	
	// set content for new row and cells
	thDayHead.textContent = "Day";			
	thHr1Head.textContent = "9-10";
	thHr2Head.textContent = "10-11";
	thHr3Head.textContent = "11-12";	
	thHr4Head.textContent = "12-13";
	thHr5Head.textContent = "13-14";
	thHr6Head.textContent = "14-15";
	thHr7Head.textContent = "15-16";	
	thHr8Head.textContent = "16-17";
	
	// append new cells to new row
	trHead.appendChild(thDayHead);
	trHead.appendChild(thHr1Head);
	trHead.appendChild(thHr2Head);
	trHead.appendChild(thHr3Head);
	trHead.appendChild(thHr4Head);
	trHead.appendChild(thHr5Head);
	trHead.appendChild(thHr6Head);
	trHead.appendChild(thHr7Head);
	trHead.appendChild(thHr8Head);
	
	// append to table
	target.appendChild(trHead);			
}

function createRow(day, hr1, hr2, hr3, hr4, hr5, hr6, hr7, hr8)
{
	// create row
	var tr = document.createElement("tr");
	
	// create cells
	var tdDay = document.createElement("td");
	var tdHr1 = document.createElement("td");
	var tdHr2 = document.createElement("td");
	var tdHr3 = document.createElement("td");
	var tdHr4 = document.createElement("td");
	var tdHr5 = document.createElement("td");
	var tdHr6 = document.createElement("td");
	var tdHr7 = document.createElement("td");
	var tdHr8 = document.createElement("td");
	
	// set content for new row and cells - using passed in params
	tdDay.textContent = day;			
	tdHr1.textContent = hr1;
	tdHr2.textContent = hr2;
	tdHr3.textContent = hr3;	
	tdHr4.textContent = hr4;
	tdHr5.textContent = hr5;
	tdHr6.textContent = hr6;
	tdHr7.textContent = hr7;	
	tdHr8.textContent = hr8;
	
	// append new cells to new row
	tr.appendChild(tdDay);
	tr.appendChild(tdHr1);
	tr.appendChild(tdHr2);
	tr.appendChild(tdHr3);
	tr.appendChild(tdHr4);
	tr.appendChild(tdHr5);
	tr.appendChild(tdHr6);
	tr.appendChild(tdHr7);
	tr.appendChild(tdHr8);
	
	return tr;	
}