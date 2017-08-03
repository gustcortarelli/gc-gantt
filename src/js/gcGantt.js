/* 
 * Copyright (C) 2016 gustavo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* 
 Created on : 11/12/2016, 18:03:55
 Author     : gustcortarelli
 */
var _gcGantRef;

function GCGantt(elementId, tasks, options) {

   _gcGantRef = this;

   if (!(tasks instanceof Array)) {
      console.error("Invalid arguments to task: spected array tasks.");
      return;
   }

   this.getOption = function (options, property, defaultOption) {
      return options != undefined && options[property] !== undefined && options[property] !== '' ? options[property] : defaultOption;
   }

   var _options = {
      showStartDate: this.getOption(options, 'showStartDate', false),
      showEndDate: this.getOption(options, 'showEndDate', false),
      showResources: this.getOption(options, 'showResources', true), //Show resources column
      title: {
         task: this.getOption(this.getOption(options, 'title', {task: ''}), 'task', 'Task'),
         percent: this.getOption(this.getOption(options, 'title', {percent: ''}), 'percent', 'Percent (%)'),
         resources: this.getOption(this.getOption(options, 'title', {resources: ''}), 'resources', 'Resources'),
         start: this.getOption(this.getOption(options, 'title', {start: ''}), 'start', 'Start'),
         end: this.getOption(this.getOption(options, 'title', {end: ''}), 'end', 'End'),
      },
      tasks: {
         color: this.getOption(this.getOption(options, 'tasks', {color: ''}), 'color', '#000000'),
         progressColor: this.getOption(this.getOption(options, 'tasks', {progressColor: ''}), 'progressColor', '#c9c9c9'),
      },
      group: {
         color: this.getOption(this.getOption(options, 'group', {color: ''}), 'color', '#000000'),
         progressColor: this.getOption(this.getOption(options, 'group', {progressColor: ''}), 'progressColor', '#c9c9c9'),
      }
   };

   var _startDate = null;
   var _endDate = null;
   var _arrayDates = new Array();

   var _tasks = tasks;
   var _elementId = elementId;

   document.getElementById(_elementId).setAttribute("style", "position: relative !important;")

   this.validateTasks = function (tasks) {
      if (tasks === undefined) {
         tasks = _tasks;
      }
      var _totalPercent = 0;
      for (var i in tasks) {
         if (!tasks[i].getStartDate() instanceof Date) {
            console.error(tasks[i]);
            throw "Invalid startDate: the value of startDate is not a valid instance form Date object. Task: " + tasks[i].getId() + " - " + tasks[i].getDescription();
         }
         if (!tasks[i].getEndDate() instanceof Date) {
            console.error(tasks[i]);
            throw "Invalid endDate: the value of endDate is not a valid instance form Date object. Task: " + tasks[i].getId() + " - " + tasks[i].getDescription();
         }

         //set to GMT 0
         var _date = new Date(tasks[i].getStartDate());
         _date.setUTCHours(_date.getUTCHours() + (_date.getTimezoneOffset() / 60));
         tasks[i].setStartDate(new Date(_date));

         _date = new Date(tasks[i].getEndDate());
         _date.setUTCHours(_date.getUTCHours() + (_date.getTimezoneOffset() / 60));
         tasks[i].setEndDate(new Date(_date));

         if (tasks[i].getStartDate() > tasks[i].getEndDate()) {
            console.error(tasks[i]);
            throw "Invalid dates: the startDate is greater than endDate. Task: " + tasks[i].getId() + " - " + tasks[i].getDescription();
         }

         if (tasks[i] instanceof GCTaskGroup) {
            if (tasks[i].getTasks() instanceof Array) {
               var _percentGroup = this.validateTasks(tasks[i].getTasks());
               if (tasks[i].getCalcPercent()) {
                  tasks[i].setPercent(_percentGroup);
               }
            }
         }
         _totalPercent += tasks[i].getPercent();

         if (_startDate === null || _startDate > tasks[i].getStartDate()) {
            _startDate = tasks[i].getStartDate();
         }
         if (_endDate === null || _endDate < tasks[i].getEndDate()) {
            _endDate = tasks[i].getEndDate();
         }
      }
      return _totalPercent / tasks.length;
   }

   this.createTaskArray = function () {
      var _auxDate = new Date(_startDate);
      while (_auxDate <= _endDate) {
         _arrayDates.push(new Date(_auxDate));
         _auxDate.setDate(_auxDate.getDate() + 1);
      }
   }

   /**
    * Set date values by tasks
    * @returns {undefined}
    */
   this.configGantt = function () {
      this.validateTasks();
      this.createTaskArray();
   }

   this.createDiv = function (content, classes, nobr) {
      var _div = document.createElement("DIV");
      var _nobr = document.createElement("nobr");
      var _content = document.createTextNode(content);
      _div.className = classes;
      if (nobr === false) {
         _div.appendChild(_content);
      } else {
         _nobr.appendChild(_content);
         _div.appendChild(_nobr);
      }
      return _div;
   }

   this.createDay = function (date) {
      var _div = this.createDiv("", "gc-task-day");
      _div.setAttribute("gc-date", date.getFullYear().toString() + date.getMonth().toString() + date.getDate().toString());
      return _div;
   }

   this.buildHeader = function () {
      var _row = this.createDiv(" ", "gc-row-header");
      var _div = this.createDiv(_options.title.task, "gc-task-data");
      _row.appendChild(_div);
      var _div = this.createDiv(_options.title.percent, "gc-task-percent");
      _row.appendChild(_div);
      if (_options.showStartDate) {
         var _div = this.createDiv(_options.title.start, "gc-task-start-date");
         _row.appendChild(_div);
      }
      if (_options.showEndDate) {
         var _div = this.createDiv(_options.title.end, "gc-task-end-date");
         _row.appendChild(_div);
      }
      if (_options.showResources) {
         var _div = this.createDiv(_options.title.resources, "gc-task-data");
         _row.appendChild(_div);
      }

      for (var i in _arrayDates) {
         _row.appendChild(this.createDiv(_arrayDates[i].getDate() + "/" + (_arrayDates[i].getMonth() + 1), "gc-task-header-day"));
      }
      document.getElementById(_elementId).appendChild(_row);
   }

   this.fixSize = function () {
      var pos = document.getElementById(_elementId).getBoundingClientRect();
      document.getElementById(_elementId).style.width = pos.width + "px";
   }

   this.showHideRows = function (row, hidding) {
      var _parent = row.getAttribute("gc-id").split("-");
      var _elements = getElementsByAttribute("gc-parent", _parent[1]);
      for (var i in _elements) {
         hidding = hidding == null ? _elements[i].style.display != 'none' : hidding;
         if (hasClass(_elements[i], "gc-task-group")) {
            this.showHideRows(_elements[i], hidding);
         }
         _elements[i].style.display = _elements[i].style.display == 'none' && !hidding ? '' : 'none';
      }
      var _desc = getElementByAttribute("description", 1, row);
      if (hidding) {
         _desc.innerHTML = _desc.innerHTML.replace("-", "+");
      } else {
         _desc.innerHTML = _desc.innerHTML.replace("+", "-");
      }
      this.repaint();
   }

   this.buildBody = function (tasks, level, parentTask) {
      level = level == null ? 0 : level;
      var _prefix = '';
      for (var _i = 0; _i < level; _i++) {
         _prefix += "\u00A0\u00A0";
      }

      for (var i in tasks) {
         _plusGroup = '';
         if (tasks[i] instanceof GCTaskGroup) {
            _plusGroup += "+ ";
            var _row = this.createDiv("", "gc-row gc-task-group");
            _row.setAttribute("gc-id", "group-" + tasks[i].getId());
         } else {
            var _row = this.createDiv("", "gc-row gc-task-row");
            _row.setAttribute("gc-id", "task-" + tasks[i].getId());
         }
         if (parentTask !== null) {
            _row.setAttribute("gc-parent", parentTask);
         }
         var _div = this.createDiv(_prefix + _plusGroup + tasks[i].getDescription(), "gc-task-data");
         _div.setAttribute("description", 1);
         _div.setAttribute("gc-task-id", tasks[i].getId());
         if (tasks[i] instanceof GCTaskGroup) {
            _div.onclick = function () {
               _gcGantRef.showHideRows(this.parentNode);
               _gcGantRef.onTaskNameClick(this.getAttribute("gc-task-id"), true);
            }
         } else {
            _div.onclick = function () {
               _gcGantRef.onTaskNameClick(this.getAttribute("gc-task-id"), false);
            }
         }
         _row.appendChild(_div);
         var _div = this.createDiv(tasks[i].getPercent(), "gc-task-percent");
         _row.appendChild(_div);

         if (_options.showStartDate) {
            var _div = this.createDiv(tasks[i].getStartDate().toLocaleString().slice(0, 10), "gc-task-start-date");
            _row.appendChild(_div);
         }

         if (_options.showEndDate) {
            var _div = this.createDiv(tasks[i].getEndDate().toLocaleString().slice(0, 10), "gc-task-end-date");
            _row.appendChild(_div);
         }

         if (_options.showResources) {
            if (tasks[i] instanceof GCTask) {
               var _div = this.createDiv(tasks[i].getResources().join("\n"), "gc-task-resources", false);
               _row.appendChild(_div);
            } else {
               var _div = this.createDiv('', "gc-task-resources", false);
               _row.appendChild(_div);
            }
         }

         for (var d in _arrayDates) {
            var _div = this.createDay(_arrayDates[d]);
            _row.appendChild(_div);
         }

         document.getElementById(_elementId).appendChild(_row);
         if (tasks[i] instanceof GCTaskGroup) {
            if (tasks[i].getTasks() instanceof Array) {
               this.buildBody(tasks[i].getTasks(), ++level, tasks[i].getId());
            }
         }
      }
   }

   this.showProgress = function (node, percent, color) {
      var _progress = document.createElement("div");
      var _styleStr = '';
      var _styleStr = "";

      var pos = node.getBoundingClientRect();
      _styleStr += "width:" + percent + "%;";
      _styleStr += "top:" + ((pos.height / 2) - ((pos.height / 4) / 2)) + "px;";
      _styleStr += "height:" + (pos.height / 4) + "px;";
      _styleStr += "position:absolute;";
      _styleStr += "background-color:" + color + ";";
      _progress.setAttribute("style", _styleStr);
      _progress.setAttribute("class", "gc-progress-bar");
      node.setAttribute("title", node.getAttribute("title") + " - " + percent + "%");
      node.appendChild(_progress);
   }

   this.onTaskClick = function (taskId, isGroup) {
      console.log(taskId);
      console.log(isGroup);
   }

   this.onTaskNameClick = function (taskId, isGroup) {
      console.log(taskId);
      console.log(isGroup);
   }

   this.buildTasks = function (tasks) {
      for (var i in tasks) {
         var _date = tasks[i].getStartDate();
         var _startDateAttr = _date.getFullYear().toString() + _date.getMonth().toString() + _date.getDate().toString();

         _date = tasks[i].getEndDate();
         var _endDateAttr = _date.getFullYear().toString() + _date.getMonth().toString() + _date.getDate().toString();
         //is a task group
         var node = document.createElement("div");
         var _styleStr = "";
         var _rowTask = null;

         //task type group
         if (tasks[i] instanceof GCTaskGroup) {
            //build task group
            _rowTask = getElementByAttribute("gc-id", "group-" + tasks[i].getId(), document.getElementById(_elementId));
            node.setAttribute("id", "group-bar-id-" + tasks[i].getId());
            _styleStr += "background-color:" + (tasks[i].getColor() != null ? tasks[i].getColor() : _options.group.color) + ";";
            node.setAttribute("class", "gc-group-bar");
         } else {
            //build task
            _rowTask = getElementByAttribute("gc-id", "task-" + tasks[i].getId(), document.getElementById(_elementId));
            node.setAttribute("id", "task-bar-id-" + tasks[i].getId());
            _styleStr += "background-color:" + (tasks[i].getColor() != null ? tasks[i].getColor() : _options.tasks.color) + ";";
            node.setAttribute("class", "gc-task-bar");
         }
         node.onclick = function () {
            _gcGantRef.onTaskClick(this.getAttribute("gc-task-id"), (tasks[i] instanceof GCTaskGroup));
         };

         var _cellDateStart = getElementByAttribute("gc-date", _startDateAttr, _rowTask);
         var _cellDateEnd = getElementByAttribute("gc-date", _endDateAttr, _rowTask);
         var pos = _cellDateStart.getBoundingClientRect();
         var posEnd = _cellDateEnd.getBoundingClientRect();
         var _size = posEnd.right - pos.left - 6;
         var _ganttPositions = document.getElementById("gc-gantt").getBoundingClientRect();
         _styleStr += "height:" + (pos.height - 4) + "px;";
         _styleStr += "width:" + _size + "px;";
         _styleStr += "left:" + (pos.left - _ganttPositions.left + 2) + "px;";
         _styleStr += "top:" + (pos.top - _ganttPositions.top + 2) + "px;";
         _styleStr += "position:absolute;";
         node.setAttribute("style", _styleStr);
         node.setAttribute("title", tasks[i].getDescription());
         node.setAttribute("gc-task-id", tasks[i].getId());
         
         if (tasks[i] instanceof GCTaskGroup) {
            //append row group data
            _rowTask.appendChild(node);
            this.showProgress(node, tasks[i].getPercent(), (tasks[i].getProgressColor() == null ? _options.group.progressColor : tasks[i].getProgressColor()));
            //create tasks in group
            this.buildTasks(tasks[i].getTasks());
         } else {
            //create a task
            _rowTask.appendChild(node);
            this.showProgress(node, tasks[i].getPercent(), (tasks[i].getProgressColor() == null ? _options.tasks.progressColor : tasks[i].getProgressColor()));
         }
      }
   }

   this.buildGantt = function () {
      document.getElementById(_elementId).classList.add("gc-gantt");
      this.buildHeader();
      this.buildBody(_tasks, 0, null);
      this.buildTasks(_tasks);
      this.fixSize();
   }

   this.repaint = function () {
      var _bars = document.getElementsByClassName("gc-task-bar");
      while (_bars.length > 0) {
         _bars[0].parentNode.removeChild(_bars[0]);
      }

      _bars = document.getElementsByClassName("gc-group-bar");
      while (_bars.length > 0) {
         _bars[0].parentNode.removeChild(_bars[0]);
      }
      this.buildTasks(_tasks);
      this.fixSize();
   }

   this.createTasksFromJSON = function (_jsonTasks) {
      var _tasksReturn = [];
      for (var i in _jsonTasks) {
         if (_jsonTasks[i].tasks != null) {
            var _arrayTasks = this.createTasksFromJSON(_jsonTasks[i].tasks);
            var group = new GCTaskGroup(
               _jsonTasks[i].id,
               new Date(_jsonTasks[i].start),
               new Date(_jsonTasks[i].end),
               _jsonTasks[i].description,
               _arrayTasks,
               _jsonTasks[i].calculatePercent,
               _jsonTasks[i].percent,
               _jsonTasks[i].color,
               _jsonTasks[i].progressColor
               );
            _tasksReturn.push(group);
         } else {
            _tasksReturn.push(new GCTask(
               _jsonTasks[i].id,
               new Date(_jsonTasks[i].start),
               new Date(_jsonTasks[i].end),
               _jsonTasks[i].description,
               _jsonTasks[i].percent,
               _jsonTasks[i].resources,
               _jsonTasks[i].color,
               _jsonTasks[i].progressColor
               ));
         }
      }
      return _tasksReturn;
   }

   if (_tasks.constructor == Array) {
      //var _jsonTasks = JSON.parse(_tasks);
      _tasks = this.createTasksFromJSON(_tasks);
   }

   this.configGantt();
   this.buildGantt();

}

function GCTaskGroup(groupId, startDate, endDate, description, tasks, calcPercent, percent, color, progressColor) {

   var _id = groupId;
   var _startDate = startDate;
   var _endDate = endDate;
   var _description = description;
   var _calcPercent = calcPercent === undefined ? true : calcPercent;
   var _percent = percent === undefined ? 0 : percent;
   var _color = color == null || color == '' ? null : color;
   var _progressColor = progressColor == null || progressColor == '' ? null : progressColor;
   var _tasks = tasks === undefined ? [] : tasks;

   this.setId = function (id) {
      _id = id;
   }
   this.getId = function () {
      return _id;
   }

   this.setStartDate = function (date) {
      _startDate = date;
   }
   this.getStartDate = function () {
      return _startDate;
   }

   this.setEndDate = function (date) {
      _endDate = date;
   }
   this.getEndDate = function () {
      return _endDate;
   }

   this.setDescription = function (description) {
      _description = description;
   }
   this.getDescription = function () {
      return _description;
   }

   this.setCalcPercent = function (calcPercent) {
      _calcPercent = calcPercent;
   }
   this.getCalcPercent = function () {
      return _calcPercent;
   }

   this.setPercent = function (percent) {
      _percent = percent;
   }
   this.getPercent = function () {
      return _percent;
   }

   this.setCustomData = function (customData) {
      _customData = customData;
   }
   this.getCustomData = function () {
      return _customData;
   }

   this.setTasks = function (tasks) {
      _tasks = tasks;
   }
   this.getTasks = function () {
      return _tasks;
   }

   this.setColor = function (color) {
      _color = color;
   }
   this.getColor = function () {
      return _color;
   }

   this.setProgressColor = function (progressColor) {
      _progressColor = progressColor;
   }
   this.getProgressColor = function () {
      return _progressColor;
   }
}

function GCTask(taskId, startDate, endDate, description, percent, resources, color, progressColor) {

   var _id = taskId;
   var _startDate = startDate;
   var _endDate = endDate;
   var _description = description;
   var _percent = percent === undefined ? 0 : percent;
   var _resources = resources === undefined ? [] : resources;
   var _color = color == null || color == '' ? null : color;
   var _progressColor = progressColor == null || progressColor == '' ? null : progressColor;

   this.setId = function (id) {
      _id = id;
   }
   this.getId = function () {
      return _id;
   }

   this.setStartDate = function (date) {
      _startDate = date;
   }
   this.getStartDate = function () {
      return _startDate;
   }

   this.setEndDate = function (date) {
      _endDate = date;
   }
   this.getEndDate = function () {
      return _endDate;
   }

   this.setDescription = function (description) {
      _description = description;
   }
   this.getDescription = function () {
      return _description;
   }

   this.addResource = function (resource) {
      _resources.push(resource);
   }
   this.setResources = function (resources) {
      _resources = resources;
   }
   this.getResources = function () {
      return _resources;
   }

   this.setPercent = function (percent) {
      _percent = percent;
   }
   this.getPercent = function () {
      return _percent;
   }

   this.setCustomData = function (customData) {
      _customData = customData;
   }
   this.getCustomData = function () {
      return _customData;
   }

   this.setColor = function (color) {
      _color = color;
   }
   this.getColor = function () {
      return _color;
   }

   this.setProgressColor = function (progressColor) {
      _progressColor = progressColor;
   }
   this.getProgressColor = function () {
      return _progressColor;
   }
}

function getElementByAttribute(attribute, value, context) {
   var nodeList = (context || document).getElementsByTagName('*');
   var nodeArray = [];
   var iterator = 0;
   var node = null;

   while (node = nodeList[iterator++]) {
      if (node.hasAttribute(attribute) && node.getAttribute(attribute) == value) {
         return node;
      }
   }

   return null;
}

function getElementsByAttribute(attribute, value, context) {
   var nodeList = (context || document).getElementsByTagName('*');
   var nodeArray = [];
   var iterator = 0;
   var node = null;

   while (node = nodeList[iterator++]) {
      if (node.hasAttribute(attribute) && node.getAttribute(attribute) == value) {
         nodeArray.push(node);
      }
   }

   return nodeArray;
}

function hasClass(element, cls) {
   return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}
