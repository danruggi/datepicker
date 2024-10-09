////////////////// ***** ////////////////////
// desky calendar Javascript
// by Daniele Rugginenti
// 2024 10 01 ver. 6.0b  -- Key navigation Support (Beta)
// 2024 10 01 ver. 5.6   -- Added support for Aria
// 2024 10 01 ver. 5.5   -- Stable tested version
// 2024 10 01 ver. 5.2   -- Minor fixes
// 2024 09 20 ver. 5.0   -- Completely rewritten to accept an option dict and using classes
// <<<<<>>>>>
// 2022 07 27 ver. 4.3.1 -- Any input placeholder Any
// 2022 07 27 ver. 4.3   -- Any input value empty
// 2022 07 22 ver. 4.2   -- UTC dates
// 2022 05 16 ver. 3.5   -- Working on github
// 2022 05 16 ver. 3.0   -- Make it Independent
// 2021 10 01 ver. 2.5   -- Adding mobile full page support
// 2021 08 28 ver. 2.0   -- rev 1
////////////////////////////////////////////

function adjustCalendarPosition(container) {
    const { bottom, right } = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (right > windowWidth) {
        container.style.right = '2px';
    }

    // Additional positioning logic can go here if needed (e.g., top/bottom adjustments)
}

function generateDowList() {
    const startDate = new Date(2021, 8);  // September 2021
    let dows = "";

    for (let i = 1; i <= 21; i++) {
        startDate.setDate(i);
        const dowFull = startDate.toLocaleString('default', { weekday: 'long' });
        const dowChar = dowFull.charAt(0);
        if (dows.length !== 0 || startDate.getDay() === 0) {
            dows += `<span aria-label='${dowFull}'>${dowChar}</span>`;
        }
        if (startDate.getDay() === 6 && dows.length !== 0) {
            break;
        }
    }

    return dows;
}

function buildCalendarHTML(id, options) {
    const mode = options.mode || 'single';
    const extraClass = mode === 'single' ? 'single' : '';
    const anyDateOption = options.anyDate ? buildAnyDateHTML(id) : '';

    return `
        <div class='desky-dark-container desky-cal-hidden'>
            <div class='desky-calendar-container ${extraClass}' id='deskycal_${id}'>
                <h2 id="Chose Date - for ${id}" class="desky-cal-hidden">Calendar selector for ${id}</h2>
                <span class='desky-cal-close' id='desky-close-${id}'>X</span>
                ${mode === 'double' ? buildLeftSectionHTML(id) : ''}
                <div class='right'>
                    ${buildRightSectionHTML(id)}
                    ${anyDateOption}
                </div>
            </div>
        </div>
        `;
    }

function buildLeftSectionHTML(id) {
    return `
        <div class='left'>
            <span class='left-today'>Today</span>
            <span class='left-day'></span>
            <span class='left-mon'></span>
        </div>
    `;
}

function buildRightSectionHTML(id) {
    return `
        <div class='desky-cal-right-header arrows'>
            <span class='desky-arrow sel-prev-month'>&lt;</span>
            <span class='desky-cal-month-name'></span>
            <span class='desky-cal-month-num desky-cal-hidden'></span>
            <span class='desky-arrow sel-next-month'>&gt;</span>
        </div>
        <div class='desky-cal-right-bottom'>
            <div class='desky-cal-dow-list'></div>
            <div class='desky-cal-day-list'></div>
        </div>
    `;
}

function buildAnyDateHTML(id) {
    return `<span data-day='calsel_anyDate_${id}' class='curr-month cal-sel-day any-date-day'>
                Any Date
            </span>`;
}

function parseHTML(htmlString) {
    // Create a template element to hold the HTML
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim(); // Trim the string to avoid unwanted text nodes
    return template.content; // Return the entire content
}

class DeskyCalendar {
    constructor(options) {
        this.options = options || {};
        this.calendars = {};
        this.init();
    }

    init() {
        const inputs = Object.keys(this.options);
        if (inputs.length === 0) {
            console.error("Initialize deskyOpts before using this function");
            return;
        }
        inputs.forEach(id => this.setupCalendar(id));
        // console.log(this.options)

    }

    createContainer(id) {
        const oldInput = document.getElementById(id);
        if (!oldInput) {
            console.error(`Input id ${id} not found`);
            return;
        }
        const parent = oldInput.parentNode;

        // Create a new input instance and store it in the calendars object
        const newInput = oldInput.cloneNode(true);
        newInput.readOnly = true;
        newInput.dataset.origId = id;
        newInput.setAttribute('aria-label', 'Select date');
        newInput.setAttribute('role', 'button'); // since it acts like a button
        newInput.addEventListener('click', e => this.calSelShowUp(e, id));

        // Create a new parent container for this specific input
        const newParent = document.createElement('div');
        newParent.id = `desky-added-parent-${id}`;
        newParent.classList.add('desky-cal-parent', 'deskycal');
        newParent.dataset.origId = id;

        newParent.appendChild(newInput);
        parent.replaceChild(newParent, oldInput); // Replace the original input with the new parent

        // Store references in the calendars object
        this.calendars[id] = {
            newInput: newInput,
            newParent: newParent,
            calendarWrapper: null, // Initialize as null for later use
            handleKeyShowUp: null,
            shownUp: false,
        };
        // console.log(this.calendars)

        // Add event listener to close calendar on outside click
        // Add the keydown event listener for Enter or Spacebar
        const handleKeyShowUp = (e) => {if (!this.calendars[id].shownUp && (e.key === 'Enter' || e.key === ' ')) {e.preventDefault(); this.calSelShowUp(e, id); } };
        this.calendars[id].handleKeyShowUp = handleKeyShowUp;
        newInput.addEventListener('keydown', handleKeyShowUp);

    }

    initializeDate(id) {
        const options = this.options[id];
        const defaultDate = options.defaultDate || new Date();
        this.calendars[id].newInput.value = this.formatDateToLocal(defaultDate);
        this.calendars[id].centerDate = defaultDate

        const nextInputId = this.options[id].nextInput
        if (nextInputId) {
            this.options[nextInputId].disableBefore = defaultDate;
            this.options[nextInputId].defaultDate = defaultDate;
        }
    }

    formatDate(date) {
        // Not used
        return date.toISOString().split('T')[0]; // Example of simple date formatting
    }

    formatDateToLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    insertCalSchema(id) {
        // console.log(this.calendars[id])
        // console.log(this.options[id])

        // Build the HTML structure
        const calendarHTML = buildCalendarHTML(id, this.options[id]);
        const calendarEL = parseHTML(calendarHTML);

        // Append the new calendar node to the parent element
        this.calendars[id].newParent.appendChild(calendarEL);
        this.calendars[id].calendarWrapper = this.calendars[id].newParent.querySelector('.desky-dark-container')
        this.calendars[id].calendarWrapper.dataset.origId = id

        this.calendars[id].calendarContainer = this.calendars[id].calendarWrapper.querySelector('.desky-calendar-container')
        this.calendars[id].calendarContainer.dataset.origId = id
        this.calendars[id].calendarContainer.setAttribute('role', 'dialog');
        this.calendars[id].calendarContainer.setAttribute('aria-labelledby', `Choose date for id:${id}`);

        // Initialize the days of the week (DOW) list
        const dowList = generateDowList();
        const dowListContainer = this.calendars[id].newParent.querySelector('.desky-cal-dow-list');
        if (dowListContainer) {
            dowListContainer.innerHTML = dowList;
        }

        // Add event listener to the close button "X"
        this.calendars[id].closeButton = this.calendars[id].newParent.querySelector('.desky-cal-close')
        this.calendars[id].closeButton.dataset.origId = id
        this.calendars[id].closeButton.setAttribute('aria-label', 'Close calendar');
        this.calendars[id].closeButton.addEventListener('click', (e) => this.closeCalSel(e, id));

        // Add event listener to next and prev months
        const nextArrow = this.calendars[id].newParent.querySelector('.sel-next-month')
        if (nextArrow) {
            nextArrow.setAttribute('aria-label', 'Next month');
            nextArrow.addEventListener('click', (e) => this.calSelNextMonth(id))
        }

        // Add event listener to next and prev months
        const prevArrow = this.calendars[id].newParent.querySelector('.sel-prev-month')
        if (prevArrow) {
            prevArrow.setAttribute('aria-label', 'Previous month');
            prevArrow.addEventListener('click', (e) => this.calSelPrevMonth(id))
        }

        const left_date = this.calendars[id].calendarContainer.querySelector('.left')
        if (left_date) {
            left_date.addEventListener('click', (e) => this.dayClick(left_date, id))
        }

        const anyDate = this.calendars[id].calendarContainer.querySelector('.any-date-day')
        if (anyDate) {
            anyDate.addEventListener('click', (e) => this.dayClick(anyDate, id))
        }
    }

    calSelDrawDays(id, curr_year, curr_month) {
        let today = new Date();
        let out = "";
        let tid = "";

        // console.log(this.calendars[id])
        // console.log(this.options[id])

        let monthNameSpan = this.calendars[id].calendarContainer.querySelector('.desky-cal-month-name');
        let monthNumSpan = this.calendars[id].calendarContainer.querySelector('.desky-cal-month-num');
        let dayListContainer = this.calendars[id].calendarContainer.querySelector('.desky-cal-day-list');

        if (isNaN(curr_year)) curr_year = today.getFullYear();
        if (isNaN(curr_month)) curr_month = today.getMonth();

        let first = new Date(curr_year, curr_month, 1);
        let last = new Date(curr_year, curr_month + 1, 0);
        let dowFirst = first.getDay();
        let dowLast = last.getDay();
        // console.log(`${first}, ${last}, ${dowFirst}, ${dowLast}`)

        let currMonthName = first.toLocaleString('default', { month: 'long' });
        let tToday = new Date();

        let todayMonthName = tToday.toLocaleString('default', { month: 'long' });
        let todayTid = `calsel_${curr_year}_${tToday.getMonth() + 1}_${tToday.getDate()}`;
        // console.log(`${currMonthName}, ${tToday}, ${todayMonthName}, ${todayTid}`)

        if (this.options[id].mode === "double") {
            this.calendars[id].calendarContainer.querySelector('.left-day').innerText = today.getDate();
            this.calendars[id].calendarContainer.querySelector('.left-mon').innerText = todayMonthName;
            this.calendars[id].calendarContainer.querySelector('.left').dataset.day = todayTid;
        }

        // Right - month name
        monthNameSpan.innerText = `${currMonthName} ${first.getFullYear()}`;
        monthNumSpan.innerText = `${curr_month}_${curr_year}`; // hidden
        monthNameSpan.setAttribute('aria-label', `Currently showing ${currMonthName} ${curr_year}`);


        let humanCurrMonth = curr_month + 1;
        let numFirst = first.getDate();
        let numLast = last.getDate();


        // Last day of past month
        let lastLast = new Date(curr_year, curr_month, 0).getDate();
        // console.log(`${numFirst}, ${numLast}, ${lastLast}`)

        // Past month from last Sunday
        for (let i = lastLast - dowFirst + 1; i <= lastLast; i++) {
            out += `<span class='last-month cal-sel-day aria-disabled='true''>
                        ${i}
                    </span>`;
        }
        // This month
        let tdate = new Date();
        tdate.setMonth(curr_month);
        for (let i = 1; i <= numLast; i++) {
            tdate = new Date(tdate.setDate(i));
            tid = `calsel_${curr_year}_${humanCurrMonth}_${tdate.getDate()}`;
            let extraClass = "";
            let extraAttr = ""
            if (todayTid === tid) extraClass = "today";

            // Disabled before
            if (this.options[id].disableBefore) {
                if (tdate.getTime() < this.options[id].disableBefore.getTime()) {extraClass = "disabled"; extraAttr = "aria-disabled='true'"}
            }
            // Disabled after
            if (this.options[id].disableAfter) {
                if (tdate.getTime() > this.options[id].disableAfter.getTime()) {extraClass = "disabled"; extraAttr = "aria-disabled='true'"}
            }

            out += `<span data-day='${tid}' class='curr-month cal-sel-day ${extraClass}' role='button' ${extraAttr} aria-label='Select day ${this.formatDateToLocal(tdate)}'>
                        ${tdate.getDate()}
                    </span>`;
        }

        // Next month
        for (let i = 1; i < 7 - dowLast; i++) {
            tdate = new Date();
            tdate.setDate(i);
            tdate.setMonth(curr_month + 1);
            out += `<span class='next-month cal-sel-day aria-disabled='true'>
                        ${tdate.getDate()}
                    </span>`;
        }

        // **Rev1
        // Adding node should be better than innerHTML
        let node = parseHTML(out);
        while (dayListContainer.firstChild) {
            dayListContainer.removeChild(dayListContainer.lastChild);
        }
        dayListContainer.appendChild(node);
        this.addDayClickListeners(dayListContainer, id)
    }

    // Function to attach event listeners to all .cal-sel-day elements
    addDayClickListeners(dayListContainer, id) {
        // Select all .cal-sel-day elements inside dayListContainer
        const days = dayListContainer.querySelectorAll('.cal-sel-day');

        // Loop through each element and add an event listener
        days.forEach((day) => {
            day.addEventListener('click', (e) => this.dayClick(day, id));
        });
    }


    calSelPrevMonth(id) {
        let currA = this.calendars[id].calendarContainer.querySelector('.desky-cal-month-num').innerText.split("_");
        let nmonth = parseInt(currA[0]) - 1;
        let currYear = parseInt(currA[1]);

        // Adjust year if the month goes below 0 (i.e., January)
        if (nmonth < 0) {
            nmonth = 11; // Set to December
            currYear--; // Decrease the year
        }

        this.calSelDrawDays(id, currYear, nmonth);
    }

    calSelNextMonth(id) {
        let currA = this.calendars[id].calendarContainer.querySelector('.desky-cal-month-num').innerText.split("_");
        let nmonth = parseInt(currA[0]) + 1;
        let currYear = parseInt(currA[1]);

        // Adjust year if the month goes above 11 (i.e., December)
        if (nmonth > 11) {
            nmonth = 0; // Set to January
            currYear++; // Increase the year
        }

        this.calSelDrawDays(id, currYear, nmonth);
    }


    calSelShowUp(e, id) {
        e.stopPropagation();

        // Toggle visibility of the calendar
        this.calendars[id].calendarWrapper.classList.toggle('desky-cal-hidden');

        // Scroll the calendar into view if the option is enabled
        if (this.options[id].scroll) {
            this.calendars[id].calendarContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Adjust calendar positioning if it goes beyond viewport boundaries
        adjustCalendarPosition(this.calendars[id].calendarContainer);

        // Draw the calendar for the current month and year
        let currYear = new Date().getFullYear();
        let currMonth = new Date().getMonth();
        if (this.calendars[id].centerDate) {
            currYear = this.calendars[id].centerDate.getFullYear()
            currMonth = this.calendars[id].centerDate.getMonth()
        }
        this.calSelDrawDays(id, currYear, currMonth);

        this.calendars[id].shownUp = true

        // Add event listener to close calendar on outside click
        const handleCloseCalSel = (e) => this.closeCalSel(e, id);
        this.calendars[id].handleCloseCalSel = handleCloseCalSel; // Store the handle
        document.addEventListener('mouseup', handleCloseCalSel);

        const handleKeyNavigation = (e) => this.handleKeyNavigation(e, id);
        this.calendars[id].handleKeyNavigation = handleKeyNavigation; // Store the handle
        document.addEventListener('keydown', handleKeyNavigation);
    }


    dayClick(element, id) {
        // console.log(id);
        if (element.classList.contains('disabled')) return;
        element.classList.add('clicked');

        let idA = element.dataset.day.split("_");
        let centerDate = new Date();

        if (idA[1] == "anyDate") {
            console.log("Clicked Anydate")
            this.calendars[id].newInput.value = "Any Date";
            this.calendars[id].centerDate = null
        } else {
            centerDate.setFullYear(idA[1]);
            centerDate.setMonth(idA[2]-1);
            centerDate.setDate(idA[3]);
            // console.log(`Center Date: ${centerDate}`)
            this.calendars[id].newInput.value = this.formatDateToLocal(centerDate)
            this.calendars[id].centerDate = centerDate
        }

        // call callback just if function is defined
        if (typeof this.options[id].callback === 'function') {
            // console.log("Call Back Function");
            this.options[id].callback(this.calendars[id].centerDate);
        }

        if (this.options[id].nextInput != null) {
            this.initializeNextInput(id)
        }
        let to=300;

        setTimeout(() => {
            element.classList.remove("clicked");
            this.closeCalSel(null, id);
        }, to);
    }

    initializeNextInput(id){
        /// redraw next input
        let nextInputId = this.options[id].nextInput;
        const centerDate = this.calendars[id].centerDate

        if (centerDate) {
            this.options[nextInputId].disableBefore = centerDate;
            this.calendars[nextInputId].centerDate = centerDate;
            this.calendars[nextInputId].newInput.value = this.formatDateToLocal(centerDate)
        } else {
            this.options[nextInputId].disableBefore = null
            this.calendars[nextInputId].centerDate = null
            this.calendars[nextInputId].newInput.value = this.formatDateToLocal(new Date());
        }

    }

    closeCalSel(event, id) {
        if (!id) {
            console.error("Missing id");
            return;
        }

        const closeButton = this.calendars[id].closeButton;
        const shouldClose = event && (
            (closeButton && closeButton.contains(event.target)) ||
            !this.calendars[id].calendarWrapper.contains(event.target)
        );

        if (shouldClose || !event) {
            this.calendars[id].calendarWrapper.classList.add('desky-cal-hidden');
            document.removeEventListener('mouseup', this.calendars[id].handleCloseCalSel);  // Use stored handle
            document.removeEventListener('keydown', this.calendars[id].handleKeyNavigation);
            this.calendars[id].shownUp = false
        }
    }

    // KEY NAVIGATION
    handleKeyNavigation(event, id) {
        event.preventDefault()

        const { key } = event;
        let selectedDay = this.calendars[id].calendarContainer.querySelector('.cal-sel-day.selected');

        // If no day is currently selected, start with today's date or the first day
        if (!selectedDay) {
            selectedDay = this.calendars[id].calendarContainer.querySelector('.cal-sel-day.today') ||
                          this.calendars[id].calendarContainer.querySelector('.curr-month.cal-sel-day');
            selectedDay.classList.add('selected');
        }
        // console.log(selectedDay)

        let selectedDate = new Date(parseInt(selectedDay.dataset.day.split('_')[1]), parseInt(selectedDay.dataset.day.split('_')[2]) - 1, parseInt(selectedDay.dataset.day.split('_')[3]));
        // console.log(currentDate)

        switch (key) {
            case 'Escape':
                this.closeCalSel(null, id);
                return
            case 'ArrowRight':  // Move to the next day
                selectedDate.setDate(selectedDate.getDate() + 1);
                break;
            case 'ArrowLeft':   // Move to the previous day
                selectedDate.setDate(selectedDate.getDate() - 1);
                break;
            case 'ArrowDown':   // Move to AnyDate
                if (!this.options[id].anyDate) {
                    return
                }
                this.calendars[id].selectedDate = selectedDate
                this.selectNewDay(id, null); // cut down the execution and go to anyDate, setting newDate at null
                return;
            case 'ArrowUp':
                if (!this.options[id].anyDate) {
                    return
                }
                selectedDate = this.calendars[id].selectedDate
                break;
            case 'PageUp':      // Move to the previous month
                this.calSelNextMonth(id);
                return;
            case 'PageDown':    // Move to the next month
                this.calSelPrevMonth(id);
                return;
            case "Enter":
                this.dayClick(selectedDay, id)
            default:
                return;  // Ignore other keys
        }

        // Update calendar view if the month has changed
        if (selectedDate.getMonth() !== parseInt(selectedDay.dataset.day.split('_')[2]) - 1) {
            this.calSelDrawDays(id, selectedDate.getFullYear(), selectedDate.getMonth());
        }

        // Select the new day
        this.selectNewDay(id, selectedDate);
    }

    selectNewDay(id, newDate) {
        // Deselect the previously selected day
        const prevSelectedDay = this.calendars[id].calendarContainer.querySelector('.curr-month.selected');
        if (prevSelectedDay) {
            prevSelectedDay.classList.remove('selected');
        }

        let newDayElement = null; // Declare newDayElement outside the conditionals

        // Handle anyDate option if enabled and newDate is not provided
        if (!newDate) {
            newDayElement = this.calendars[id].calendarContainer.querySelector('.curr-month.any-date-day');
        } else {
            newDayElement = this.calendars[id].calendarContainer.querySelector(
                `[data-day='calsel_${newDate.getFullYear()}_${newDate.getMonth() + 1}_${newDate.getDate()}']`
            );
        }

        // console.log(newDayElement)
        // Add selected class to the new day (if the newDayElement exists)
        if (newDayElement) {
            newDayElement.classList.add('selected');
        }
    }

    setupCalendar(id) {
        // Setup each calendar
        // if (!deskyOpts || !deskyOpts[id]) {
        //     console.error('Invalid desky options for id:', id);
        //     return;
        // }
        this.createContainer(id);
        this.initializeDate(id);
        this.insertCalSchema(id);
    }
}

