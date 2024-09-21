# datepicker deskycal

  
   
![Screenshot](https://danruggi.github.io/datepicker/assets/deskycal_presentation_874.webp)
### You can find working examples here >> [Demo Page](https://danruggi.github.io/datepicker/)
Derivate from a hotels software at [deskydoo](https://www.deskydoo.com)
  
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
```  
  
3. Init the calendar with a json containing all the inputs and the options
```
<script>
    new DeskyCalendar({"unique_id": {}})
</script>
```

![Screenshot](https://danruggi.github.io/datepicker/assets/screen1.png)

### Easy CSS edit with css vars. 
![Screenshot Colors](https://danruggi.github.io/datepicker/assets/screenColors.webp) 
### Check the Demo Page >> [Demo Page](https://danruggi.github.io/datepicker/)

### Examples  

###### Example 1: Two columns
Two column is default Just call the function passing just the id
```
// Just one parameter
const calOptions = {'unique_id': {mode: 'double'}}
new DeskyCalendar(calOptions)
```

###### Example 2: Call more

```
const calOptions = {
    'unique_id_1': {mode: 'double'}
    'unique_id_2': {mode: 'double', disableBefore: d2}
    'unique_id_3': {mode: 'double', nextInput: 'unique_id_4'}
    'unique_id_4': {mode: 'single', anyDate: true}
}
new DeskyCalendar(calOptions)
```


##### Example 3: One Column
One column pass single as second parmeter
```
// Just one parameter
const calOptions = {'unique_id': {}}
new DeskyCalendar(calOptions)
```
  
##### Example 4: Specify date
Pass a date as third parameter
```
//Create a date
const d = new Date(Date.parse('04 Dec 2025 00:12:00 GMT'));
const calOptions = {'unique_id': {defaultDate: d}}
new DeskyCalendar(calOptions)
```
  
##### Example 5: "Any Date"
Add a "Any Date" button to leave some free choice
Generally useful in filters and reports
Set 4th parameter as true
```
//Set anyDate
const calOptions = {'unique_id': {anyDate: true}}
new DeskyCalendar(calOptions)
```

##### Example 5: Range
Range options Specify the next ID, and clicking on the first input,
Automatically disable dates in the second input
**Use the single mode**
```
//Set the 5th parameter as the ID of the "other" input
//Use the "single" mode
const calOptions = {
    'unique_id_1': {mode: 'single', anyDate: true, nextInput: 'unique_id_2'},
    'unique_id_2': {mode: 'single', anyDate: true},
}
new DeskyCalendar(calOptions)

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

const calOptions = {
    'calendar_date_selector9': {mode: 'single', disableBefore: d2},
    'calendar_date_selector10': {mode: 'single', disableBefore: d2, disableAfter: d3},
}
new DeskyCalendar(calOptions)

```
  
##### Example 7: Scroll into view
Add a scroll into on show.
Generally useful when calendar goes out of borders on show up
Set 8th parameter as true
```
//Set true the 8th parameter
calOptions = {"calendar_date_selector11": {scroll: true}}
new DeskyCalendar(calOptions)
```
  
##### Example 8: CallBack function
Specify a call back function on day click
in 9th parameter.
Try to select a date to see the result
```
//Set a external function on 9th parameter
calOptions = {"calendar_date_selector12": {mode: 'double', callback: this_is_callback}}
new DeskyCalendar(calOptions)
```

### Check the Demo Page >> [Demo Page](https://danruggi.github.io/datepicker/)
