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
function GCDate() {

   this.getDay = function (date) {
      return date.getDate();
   }

   this.getYear = function (date) {
      return date.getFillYear();
   }

   this.getMonth = function (date) {
      return date.getMonth() + 1;
   }

   this.getDateFormat = function (date, format, separator) {
      var _arrayFormat = format.split("-");
      var _separator = separator === undefined ? '-' : separator;
      var _value = '';
      var _returnDate = '';
      for (var i in _arrayFormat) {
         switch (_arrayFormat[i].toLowerCase()) {
            case "d":
               _value = getDay(date);
               break;
            case "m":
               _value += getMonth(date);
               break;
            case "y":
               _value += getYear(date);
               break;
         }
         if (_returnDate.length === 0) {
            _returnDate += _value;
         } else {
            _returnDate += _separator + _value;
         }
      }
      return _returnDate;
   }

}