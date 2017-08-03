# gc-gantt
A pure JS Gantt chart.
The porpouse of this LIB is create a gannt chart using only Javascript, without any other framework.

## How to use? (basic usage)

Add on your page the CSS script:
```html
<link href="css/gcGantt.css" media="all" rel="stylesheet" type="text/css" />
```
You should make your won style if you want.

and also the JS script:
```html
<script src="js/gcGantt.js" type="text/javascript"></script>
```
after all, you should config your HTML, creating a div wich will be used to render a gantt chart:
```html
<div id="gc-gantt"></div>
```
and now, we build our tasks object:
```js
var jsonData = [{
     "id": 1,
     "description": "group tasks 1",
     "start": "2016-12-01",
     "end": "2016-12-15",
     "calculatePercent": true,
     "color": "#004d00",
     "tasks": [
        {
           "id": 2,
           "description": "group tasks 2",
           "start": "2016-12-03",
           "end": "2016-12-10",
           "calculatePercent": true,
           "tasks": [{
                 "id": 1,
                 "description": "Task 1",
                 "start": "2016-12-03",
                 "end": "2016-12-07",
                 "resources": ["person A", "person B"],
                 "percent": 50
              }
           ],
        }
     ]
  }
];
```
finally, make a configuration in order to build a gantt with some tasks, you must parse the element ID where the gantt's chart will be render, the task object and config object:
```js
var gcGantt = new GCGantt('gc-gantt', jsonData, {});
```
## Events
This lib is able to control click on events ans, until now, two kinds of functions are available:

**On task name click**
```js
gcGantt.onTaskNameClick = function (id, group) {
  if (group) {
     alert("Clicked on name of group name ID: " + id);
  } else {
     alert("Clicked on name of task name ID: " + id);
  }
}
```
**On task click**
```js
gcGantt.onTaskClick = function (id, group) {
  if (group) {
     alert("Clicked on group ID: " + id);
  } else {
     alert("Clicked on task ID: " + id);
  }
}
```
## Options
You can change some stuffs into gantt parsing some configurations on config object:
```js
var _config = {
      showResources: true, //boolean - show/hide column resource
      showStartDate: true, //boolean - show/hide column date start
      showEndDate: true, //boolean - show/hide column date end
      title: { //change column titles
         task: "Task name", // column task title
         start: "Start", // column date start title
         end: "End", // column date end title
         resources: "Resources", // column resource titlte
         percent: "Percent (%)" // column percent title
      }
   };
```
