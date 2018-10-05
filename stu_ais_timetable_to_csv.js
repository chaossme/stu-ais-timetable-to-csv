function getDaysBetweenDates (start, end, day) {
	var result = [];
	var current = new Date(start);
	current.setDate(current.getDate() + (day - current.getDay() + 7) % 7);

	while (current < end) {
		result.push(new Date(+current));
		current.setDate(current.getDate() + 7);
	}
	return result;
}

function generateAndDownloadCsv (rows) {
	var csv = rows.join('\n');
	var filename = 'export.csv';

	if (!csv.match(/^data:text\/csv/i)) { csv = 'data:text/csv;charset=utf-8,' + csv; }

	var data = encodeURI(csv);
	var link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();
}

function convertTime (time) {
	var [hours, minutes] = time.split('.');
	hours = Number(hours);
	var pm = hours > 12;

	if (pm) { hours -= 12; }

	return `${hours}:${minutes} ${pm ? 'pm' : 'am'}`;
}

var timetable = [];
var days = ['Po', 'Ut', 'St', 'Št', 'Pi'];
var entries = document.getElementById('tmtab_1').getElementsByTagName('tbody')[0].children;

for (var i = 0; i < entries.length; i++) {
	var cells = entries[i].getElementsByClassName('odsazena');

	var [day, from, until, course, entry, room, teacher] = Array.prototype.slice.call(cells).slice(0, 7).map(function (item) {
		return item.textContent;
	});

	timetable.push({
		day: days.indexOf(day) + 1,
		startTime: convertTime(from),
		endTime: convertTime(until),
		name: course,
		isLecture: entry === 'Prednáška',
		description: room + ', ' + teacher
	});
}

var rows = ['Subject,Description,Start Date,Start Time,End Date,End Time'];

var startDate = prompt('Zadaj začiatok semestra (MM/DD/YYYY):')
var endDate = prompt('Zadaj koniec semestra (MM/DD/YYYY):')

for (var i = 1; i < 6; i++) {
	var dates = getDaysBetweenDates(new Date(startDate), new Date(endDate), i);

	for (var j = 0; j < dates.length; j++) {
		var date = dates[j].toLocaleDateString('en-US');
		var tt = timetable.filter(function (item) { return item.day == i; });

		for (var k = 0; k < tt.length; k++) {
			var subject = tt[k];
			rows.push([subject.name, subject.description, date, subject.startTime, date, subject.endTime]
				.map(function (item) {
					return '"' + item + '"';
				})
				.join(','));
		}
	}
}

generateAndDownloadCsv(rows);
