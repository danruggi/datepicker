# datepicker deskycal
##### Derivate from a hotels software at [deskydoo](https://www.deskydoo.com)  
  
   
**Ultralight (6.3KB) datepicker vanilla JS CSS with no dependencies**  

Click on the input fields downthere to see the examples  

📳 Full Responsive   
🌱 Double / Single Format  
⚙️ Set The Date  
🍀 Add "Any Date" Option  
🔒 Disable Dates  
💡 Relates 2 datepickers for range  
📎 Execute external function on click  
🤏 Minified version is just 6.3K 
✌️ Just include 2 files and call many times you need in a page  
  
Easy usage:  

1. Include CSS and JS  

```
<link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/danruggi/datepicker/css/deskyCal.css'>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/danruggi/datepicker/js/deskyCal.js"></script>
```
  
2. Create any field with an unique ID in the page  
```
<input id='unique_id'>

// OR, can also be a button
<button id='unique_id'></button>

// OR, can also be an img, OR any element
<img src='your_img.jpg' id='unique_id'></img>
```  
3. Init the calendar with
```
<script>
 initDeskyCal(unique_id);
</script>
```

![Screenshot](http://localhost:81/datepicker/assets/screen1.png)

### Examples
###### Example 1: Two columns
Two column is default Just call the function passing just the id
```
// Just one parameter
initDeskyCal("calendar_date_selector1");

// Or Passing the "double" it's the same
initDeskyCal("calendar_date_selector1", "double");
```
  
##### Example 2: One Column
One column pass single as second parmeter
```
initDeskyCalendar("calendar_date_selector2", "single");
```
  
##### Example 3: Specify date
Pass a date as third parameter
```
//Create a date const d = Date.parse('04 Dec 2025 00:12:00 GMT'); initDeskyCalendar("calendar_date_selector3", null, d);
calendar_date_selector3
```
  
##### Example 4: "Any Date"
Add a "Any Date" button to leave some free choice
Generally useful in filters and reports
Set 4th parameter as true
```
//Set true the 4th parameter initDeskyCalendar("calendar_date_selector4", null, d, true);
```

##### Example 5: Range
Range options Specify the next ID, and clicking on the first input,
Automatically disable dates in the second input
**Use the single mode**

```
//Set the 5th parameter as the ID of the "other" input
//Use the "single" mode
initDeskyCalendar("calendar_date_selector5", "single", null, null, "calendar_date_selector6");

initDeskyCalendar("calendar_date_selector6", "single");

//Or use in conjuncton with "any date" or other options
initDeskyCalendar("calendar_date_selector7", "single", null, true, "calendar_date_selector8");

initDeskyCalendar("calendar_date_selector8", "single", null, true);
```

##### Example 6: Disable Before or After Date
Disable selection before or after a date
Using 6th and 7th parameters
```
//Create a date
const d2 = new Date();
const d3 = new Date();

//just an example, 2 days before and 10 days after
d2.setTime(d2.getTime()-(2*3600*24*1000));
d3.setTime(d3.getTime()+(10*3600*24*1000));

//Set a date at 6th or 7th parameter
initDeskyCalendar("calendar_date_selector9", "single", null, null, null, d2);

initDeskyCalendar("calendar_date_selector10", "single", null, null, null, d2, d3);
calendar_date_selector9
```
  
##### Example 7: Scroll into view
Add a scroll into on show.
Generally useful when calendar goes out of borders on show up
Set 8th parameter as true
```
//Set true the 8th parameter initDeskyCalendar("calendar_date_selector11", null, null, null, null, null, null, true);
```
  
##### Example 8: CallBack function
Specify a call back function on day click
in 9th parameter.
Try to select a date to see the result
```
//Set a external function on 9th parameter initDeskyCalendar("calendar_date_selector5", null, null, null, call_back_function);
```
