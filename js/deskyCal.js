////////////////// ***** ////////////////////
// desky calendar Javascript 
// by Daniele Rugginenti
// 2021 08 28 ver. 2.0 rev 1
// 2021 10 01 ver. 2.5 -- Adding mobile full page support 
// 2022 05 16 ver. 3.0 -- Make it Independent 
////////////////////////////////////////////

/// Version Variable
const deskyCalVersion = "3.0";
///////////

const deskyOpts = {};

function initDeskyCalendar(id, mode = 'double', in_date = null, any_date = false, next_input = null, disabled_before=null, scroll=false, callback = null) {
	let cb;
	let input = document.getElementById(id);
	if (input == null) {
		console.log("[deskyCal] input id "+id+" not found");
		return;
	}

	/// Check Inputs
	if (mode == null) mode="double";	
	if (!['double', 'single'].includes(mode)) console.log('[deskyCal] "mode" not valid; "single" or "double" are valid');
	if (in_date < 0) console.log('[deskyCal] timestamp can\'t be negative');

	/// Create Options Object
	deskyOpts[id] = {'mode':mode, 'in_date':in_date, 'any_date':any_date, 'next_input':next_input, 'disabled_before':disabled_before, 'callback': callback, 'scroll':scroll};

	let containerHtml = "<div id='deskycal_container_"+id+"' class='deskycal'></div>";
	
	/// This gives a #document, get first child
	let container = parseHTML(containerHtml);
	let newParent = container.firstChild;

	let newInput = input.cloneNode(true);
	let parent = input.parentNode;

	newParent.appendChild(newInput);
	parent.replaceChild(newParent, input);

	//set input property and event listener
	newInput.readOnly = true;
	newInput.addEventListener('click', function(e){showCalSel(e,this); });

	// set input date to show, if not any date. 
	let curr_month, curr_year;
	if (!any_date) {
		let inDate = new Date();
		if (in_date > 1000) {
			// console.log("mills "+mills)
			inDate.setTime(in_date);
			curr_month = inDate.getMonth();
			curr_year = inDate.getFullYear();
			deskyOpts[id].in_date=inDate.getTime();
		}
		
		// date format just in US format right now 
		newInput.value = inDate.getFullYear()+"-"+String(parseInt(inDate.getMonth())+1).padStart(2,"0")+"-"+String(inDate.getDate()).padStart(2,'0')
	} else newInput.value = "Select";

	// Prepare disabled dates, if any. Will be used in draw schema
	let disDate = new Date();
	if (disabled_before > 1000) {
		disDate.setTime(disabled_before);
		deskyOpts[id].disabled_before=disDate.getTime()+86400000;
	}

	// init and draw calendars with inDate month and year
	insertSchema(newParent, id);
	drawCalSel(newParent, id, curr_year, curr_month);

	return;
}

function insertSchema(parent, id) {
	let el = "";
	let extraClass= "";
	if (deskyOpts[id].mode == "single") extraClass = "single";
	el+= "<div class='desky-dark-container desky-cal-hidden'>";
	el+= "	<div class='desky-cal-container  "+extraClass+"' id='deskycal_"+id+"'>";
	// X to close
	el+= "		<span class='desky-cal-close' onclick='closeCalSel()'>X</span>"; 
	if (deskyOpts[id].mode == "double") {
		// Left -- Big Date
		el+= "		<div class='flex-container flex-col centered left' onClick='dayClick(this)'>";
		el+= "			<span class='left-today'>Today</span> <span class='left-day'></span> <span class='left-mon'></span>";
		el+= "		</div>";
	}
	// Right -- Calendar
	el+= "		<div class='right'>";
	// Header
	el+= "			<div class='desky-cal-right-header arrows'>";
	el+= "				<span class='desky-arrow' onclick='calSelPrev(this)'><</span>";
	el+= "				<span class='desky-cal-month-name'></span>";
	el+= "				<span class='desky-cal-month-num desky-cal-hidden' ></span>";
	el+= "				<span class='desky-arrow' onclick='calSelNext(this)'>></span>";
	el+= "			</div>";
	// Daylist
	el+= "			<div class='desky-cal-right-bottom'>";
	el+= "				<div class='desky-cal-dow-list'></div>";
	el+= "				<div class='desky-cal-day-list'> </div>";
	el+= "			</div>";
	// AnyDate
	if (deskyOpts[id].any_date) {
		el+="			<span id='calsel_anyDate_"+id+"' class='curr-month cal-sel-day' onClick='dayClick(this)'>Any Date</span>";
	}
	// Close right
	el+= "		</div>"; 
	el+= "	</div>";
	el+= "</div>";
	// console.log(el);

	/// Create the node and append in parent
	let node = parseHTML(el);
	parent.appendChild(node);

	// INIT all weekdays in localestring format and set, it creates dows string with spans with S M T W T F S  
	let tdate = new Date();
	tdate.setYear(2021);
	tdate.setMonth(8); 
	let dows = "";
	for (let i=1; i<=21; i++) {
		tdate.setDate(i);
		if (dows.length != 0) dows += "<span>"+tdate.toLocaleString('default', { weekday: 'long' }).charAt(0)+"</span>";
		if (tdate.getDay() == 0) dows += "<span>"+tdate.toLocaleString('default', { weekday: 'long' }).charAt(0)+"</span>";
		if (tdate.getDay() == 6 && dows.length != 0) break;
		// console.log(i+"--"+dows);
	}
	// console.log("dows:"+dows);
	parent.querySelector('.desky-cal-dow-list').innerHTML = dows;

	// End weekdays
}


function drawCalSel(calParent, inputId, curr_year, curr_month) {
	// console.log(calParent);
	
	// // let inputId = calParent.id.split("_").slice(2).join("_");
	// console.log(calParent.id);
	// console.log(inputId);
	console.log(curr_month+" "+curr_year);
	let today = new Date();
	let tdate = new Date();
	let out="";
	let tid = "";

	let monthNameSpan = calParent.querySelector('.desky-cal-month-name');
	let monthNumSpan = calParent.querySelector('.desky-cal-month-num');
	let calContainer = calParent.querySelector('.desky-cal-day-list');

	if ( isNaN(curr_year)) curr_year = today.getFullYear();
	if ( isNaN(curr_month)) curr_month = today.getMonth();

	let first = new Date(curr_year, curr_month, 1);
	let last = new Date(curr_year, curr_month+1, 0);
	let dowFirst = first.getDay();	
	let dowLast = last.getDay();

	let currMonthName = first.toLocaleString('default', { month: 'long' });
	// first.getFullYear();

	// Left - Day and month - TODAY
	let tToday = new Date();

	let todayMonthName = tToday.toLocaleString('default', { month: 'long' });
	let todayTid = "calsel_"+curr_year+"_"+(parseInt(tToday.getMonth())+1)+"_"+tToday.getDate();

	if (deskyOpts[inputId].mode == "double") {
		calParent.querySelector('.left-day').innerText = today.getDate();
		calParent.querySelector('.left-mon').innerText = todayMonthName;
		calParent.querySelector('.left').dataset.day = todayTid;
	}

	// Right - month name 
	monthNameSpan.innerText = currMonthName+" "+first.getFullYear();
	monthNumSpan.innerText = curr_month+"_"+curr_year; //hidden

	let humanCurrMonth=curr_month+1;

	let numFirst = first.getDate();
	let numLast = last.getDate();

	// console.log("***"+first+"*** ----> "+dowFirst+" month:"+curr_month+" year:"+curr_year);
	

	//last day of past month
	let lastLast = new Date(curr_year, curr_month, 0).getDate(); 

	// Past month from last sunday 
	// that's obtained subtracting last day in the past month with first day of week of current month
	tdate = new Date();
	for (let i=lastLast-dowFirst+1; i<=lastLast; i++) {		
		out += "<span class='last-month cal-sel-day'>"+i+"</span>";
	}

	// This month
	tdate = new	Date();
	tdate.setMonth(curr_month);
	for (let i=1; i<=numLast; i++) {
		tdate = new Date(tdate.setDate(i));
		tid = "calsel_"+curr_year+"_"+humanCurrMonth+"_"+tdate.getDate();
		let extraClass="";
		if (todayTid == tid) extraClass="today";
		if (tdate.getTime() < deskyOpts[inputId].disabled_before) extraClass="disabled";
		out += "<span data-day='"+tid+"' class='curr-month cal-sel-day "+extraClass+"' onClick='dayClick(this)'>"+tdate.getDate()+"</span>";
		// console.log("this: "+tdate);
	}

	for (let i=1; i<7-dowLast; i++) {
		tdate = new Date();
		tdate.setDate(i);
		tdate.setMonth(curr_month+1);
		out += "<span class='next-month cal-sel-day'>"+tdate.getDate()+"</span>";
		// console.log("next:"+tdate+" num:"+numFirst+" i:"+i+" dowLast:"+dowLast);
	}

	// **Rev1
	// Adding node should be better then innerHTML
	let node = parseHTML(out);
	while (calContainer.firstChild) calContainer.removeChild(calContainer.lastChild);
	calContainer.appendChild(node);
	// calContainer.innerHTML = out;
}

function calSelPrev(el) {
	let calParent = getParentByClass(el, 'desky-cal-container');
	let currA = calParent.querySelector('.desky-cal-month-num').innerText.split("_");
	let nmonth = parseInt(currA[0])-1
	drawCalSel(calParent, calParent.id.split("_").slice(1).join("_"), currA[1], nmonth);
}

function calSelNext(el) {
	let calParent = getParentByClass(el, 'desky-cal-container');
	let currA = calParent.querySelector('.desky-cal-month-num').innerText.split("_");
	let nmonth = parseInt(currA[0])+1;
	drawCalSel(calParent, calParent.id.split("_").slice(1).join("_"), currA[1], nmonth);
}

function dayClick(el) {
	// console.log(id);
	if (el.classList.contains('disabled')) return;
	el.classList.add('clicked');

	let idA = el.dataset.day.split("_");
	let parId = getParentByClass(el, 'desky-cal-container').id;
	let targetId = parId.substring(parId.indexOf("_") + 1);
	// console.log(target_id);
	let input = document.getElementById(targetId);
	let centerDate = new Date();

	if (idA[1] == "anyDate") {
		input.value = "Any";
	} else {
		centerDate.setYear(idA[1]);
		centerDate.setMonth(idA[2]-1);
		centerDate.setDate(idA[3]);
		// input.value = centerDate;
		input.value = centerDate.getFullYear()+"-"+String(parseInt(centerDate.getMonth())+1).padStart(2,"0")+"-"+String(parseInt(centerDate.getDate())).padStart(2,'0');
	}

	// call callback just if function is defined
	if (typeof deskyOpts[targetId].callback === 'function') {
		console.log("call back function");
		deskyOpts[targetId].callback(centerDate);
	}

	if (deskyOpts[targetId].next_input != null) {
		/// redraw next input
		let nextInput = deskyOpts[targetId].next_input;
		let nextInputParent = document.getElementById('deskycal_container_'+nextInput);
		let nextInputEl=document.getElementById(nextInput);

		deskyOpts[nextInput].disabled_before = centerDate.getTime();
		nextInputEl.value = centerDate.getFullYear()+"-"+String(parseInt(centerDate.getMonth())+1).padStart(2,"0")+"-"+String(parseInt(centerDate.getDate())).padStart(2,'0');
		drawCalSel(nextInputParent, nextInput, idA[1], idA[2]-1)
	}
	let to=300; 

	setTimeout(function(){
		el.classList.remove("clicked");
		closeCalSel();
	},to)
}

function showCalSel(e, el){
	e.stopPropagation();
	// closeCalSel();
	console.log(el);
	let par = el.parentNode;
	let cls = par.querySelector('.desky-dark-container');
	// let cls = document.getElementById('cal_'+el.id);
	// let par = getParentByClass(cls, 'date-selector');
	
	// let cls = par.querySelector('.desky-cal-container');
	cls.classList.toggle('desky-cal-hidden');

	if (deskyOpts[el.id].scroll) cls.scrollIntoView();
	
	document.addEventListener('mouseup',deskyCalSelEvent)
	return;
}

function closeCalSel(){
	document.querySelectorAll('.desky-dark-container').forEach(function(el){
		if (!el.classList.contains('desky-cal-hidden')) {
			el.classList.add('desky-cal-hidden');
			return;
		}
	});
	document.removeEventListener('mouseup',deskyCalSelEvent);
}

function deskyCalSelEvent(e) {
	document.querySelectorAll('.deskycal').forEach(function(el){
		let cls = el.querySelector('.desky-dark-container');
		if (cls == null) return;
		if (!cls.classList.contains('desky-cal-hidden')) {
			if (!cls.contains(e.target)) closeCalSel();
		}
	});
}

function getParentByClass(el, className, maxDepth=10) {
	let i=0;
	while (!el.classList.contains(className)) {
		el=el.parentElement;
		i++;
		if (i>maxDepth) return false;
	}
  	return el;
}

function parseHTML(html) {
	// It creates a node, and not need to reload the dom with innerHTML, but can use appendChild instead.
	// Added at middle project, maybe everything could be faster js side.
	var t = document.createElement('template');
	t.innerHTML = html;
	return t.content;
}