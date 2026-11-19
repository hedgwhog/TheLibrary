'use strict';

const ui = {
  grip: document.getElementById('grip'),
  view: document.getElementById('view'),
  output: document.getElementById('out'),
  input: document.getElementById('cmd'),
  ghost: document.getElementById('ghost'),
  promptLabel: document.getElementById('ps'),
  chips: document.getElementById('chips'),
  status: document.getElementById('status'),
};

const state = {
  data: { categories: [], plans: [], exceptions: [], bucket: [], todos: [] },
  view: innerWidth < 600 ? 'd' : 'w',
  cursor: null,
  mode: APP.loggedIn ? 'command' : 'username',
  loginUsername: '',
  history: [],
  historyIndex: 0,
  pendingConfirm: null,
  undo: null,
  printTarget: null,
  answerStart: null,
  scrolledFor: '',
  fullEdit: null,
  activeFullEdit: null,
};

const IS_TOUCH_SCREEN = matchMedia('(pointer: coarse)').matches;
const promptText = () => `${APP.username || 'you'}@index:~$`;
const isListView = () => state.view === 'bucket' || state.view === 'todo';

const DAY_NAMES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const FULL_DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const FULL_MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MINUTES_PER_DAY = 24 * 60;

const twoDigits = number => String(number).padStart(2, '0');

const toDateString = date => `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
function toDateObject(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const today = () => toDateString(new Date());

function addDays(dateString, days) {
  const date = toDateObject(dateString);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

function addMonths(dateString, months) {
  const date = toDateObject(dateString);
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  return toDateString(date);
}

const yearOf = dateString => +dateString.slice(0, 4);
const monthOf = dateString => +dateString.slice(5, 7);
const dayOfMonth = dateString => +dateString.slice(8, 10);
const daysInMonth = dateString => new Date(yearOf(dateString), monthOf(dateString), 0).getDate();
const weekdayIndex = dateString => (toDateObject(dateString).getDay() + 6) % 7;
const mondayOf = dateString => addDays(dateString, -weekdayIndex(dateString));

const nextWeekday = (from, weekday) => addDays(from, (weekday - weekdayIndex(from) + 7) % 7);

function isoWeek(dateString) {
  const thursday = toDateObject(addDays(dateString, 3 - weekdayIndex(dateString)));
  const january4 = new Date(thursday.getFullYear(), 0, 4);
  const daysBetween = (thursday - january4) / 86400000;
  return 1 + Math.round((daysBetween - 3 + (january4.getDay() + 6) % 7) / 7);
}

const toMinutes = time => +time.slice(0, 2) * 60 + +time.slice(3, 5);
const toTime = minutes => `${twoDigits(Math.floor(minutes / 60))}:${twoDigits(minutes % 60)}`;
function currentTime() {
  const now = new Date();
  return `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`;
}

const shortDate = dateString => `${dayOfMonth(dateString)} ${MONTH_NAMES[monthOf(dateString) - 1]}`;
const fullDate = dateString => `${DAY_NAMES[weekdayIndex(dateString)]} ${shortDate(dateString)} ${yearOf(dateString)}`;
function typedDate(dateString) {
  const dayMonth = `${dateString.slice(8)}-${dateString.slice(5, 7)}`;
  return yearOf(dateString) === yearOf(today()) ? dayMonth : `${dayMonth}-${yearOf(dateString)}`;
}

function realDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  const exists = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return exists ? toDateString(date) : null;
}

const ordinal = number => number + ([, 'st', 'nd', 'rd'][number % 100 >> 3 ^ 1 && number % 10] || 'th');

function parseDate(word) {
  const text = word.toLowerCase();
  const now = today();
  if (text === 'today') return now;
  if (text === 'tomorrow' || text === 'tmr') return addDays(now, 1);
  if (text === 'yesterday') return addDays(now, -1);

  if (text.length >= 3) {
    const weekday = FULL_DAY_NAMES.findIndex(name => name.startsWith(text));
    if (weekday >= 0) return nextWeekday(now, weekday);
  }

  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return realDate(+match[1], +match[2], +match[3]);

  match = text.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2}|\d{4}))?$/);
  if (!match) return null;
  const [, day, month, typedYear] = match;
  if (typedYear) return realDate(typedYear.length === 2 ? 2000 + +typedYear : +typedYear, +month, +day);

  const thisYear = yearOf(now);
  const date = realDate(thisYear, +month, +day);
  return date && date < addDays(now, -180) ? realDate(thisYear + 1, +month, +day) : date;
}

function parseTime(word) {
  const asTime = (hours, minutes = '00') => {
    const valid = (+hours < 24 || (+hours === 24 && minutes === '00')) && +minutes < 60;
    return valid ? `${twoDigits(+hours)}:${minutes}` : null;
  };

  let match = word.match(/^(\d{1,2}):(\d{2})-(\d{1,2})(?::(\d{2}))?$/);
  if (match) {
    const start = asTime(match[1], match[2]);
    const end = asTime(match[3], match[4]);
    return start && end ? [start, end] : null;
  }

  match = word.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const start = asTime(match[1], match[2]);
  if (!start || start === '24:00') return null;
  const end = Math.min(toMinutes(start) + 60, MINUTES_PER_DAY);
  return [start, end === MINUTES_PER_DAY ? '24:00' : toTime(end)];
}

function parseEvery(word) {
  if (word === 'year' || word === 'yearly') return 'year';
  if (word === 'week' || word === 'weekly') return 'week';
  if (word === 'month' || word === 'monthly') return 'month';
  if (word === 'day' || word === 'daily') return [0, 1, 2, 3, 4, 5, 6];
  const weekdays = word.split(',').filter(Boolean)
    .map(name => name.length >= 3 ? FULL_DAY_NAMES.findIndex(full => full.startsWith(name)) : -1);
  return weekdays.length && !weekdays.includes(-1) ? [...new Set(weekdays)] : null;
}

function parseDuration(word) {
  const text = String(word || '').toLowerCase();
  let match = text.match(/^(\d{1,3})(?:m|min|mins)?$/);
  if (match) return +match[1];
  match = text.match(/^(\d{1,2})h(?:(\d{1,2})(?:m|min)?)?$/) || text.match(/^(\d{1,2}):(\d{2})$/);
  if (match) return +match[1] * 60 + +(match[2] || 0);
  return null;
}

const leaveAt = (start, travelMinutes) => toTime(Math.max(0, toMinutes(start) - travelMinutes));
function travelText(minutes) {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
}

const NOTE_SEPARATOR = /(?:^|\s)--(?:\s|$)/;

function cleanNote(note) {
  return note.trim()
    .replace(/^\[\s*\]\s*/, '[ ] ')
    .replace(/^\[[xX✓]\]\s*/, '[x] ');
}

function splitNotes(text) {
  return text.split(NOTE_SEPARATOR).map(cleanNote).filter(Boolean).join('\n');
}

function parseParts(text) {
  const parts = {
    title: [], dates: [], times: [], tag: null, location: null, every: null, notes: null,
    travel: null, travelUnclear: false, returnTravel: null, returnUnclear: false, allDay: false,
  };

  const notesStart = text.search(/(^|\s)--(\s|$)/);
  if (notesStart >= 0) {
    parts.notes = splitNotes(text.slice(notesStart));
    text = text.slice(0, notesStart);
  }

  const words = text.match(/"[^"]*"?|\S+/g) || [];
  let locationWords = null;
  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    const lower = word.toLowerCase();
    let value;

    if (word.startsWith('"')) { (locationWords || parts.title).push(word.replace(/"/g, '')); continue; }
    if (lower === 'every') { locationWords = null; parts.every = (words[++index] || '').toLowerCase(); continue; }
    if ((lower === 'travel' || lower === 'return') && parseDuration(words[index + 1]) !== null) {
      locationWords = null;
      const minutes = parseDuration(words[index + 1]);
      if (lower === 'travel') parts.travel = minutes; else parts.returnTravel = minutes;
      index++;
      continue;
    }
    if (lower === 'all' && (words[index + 1] || '').toLowerCase() === 'day') {
      locationWords = null;
      parts.allDay = true;
      index++;
      continue;
    }
    if (/^\[.+\]$/.test(word)) { locationWords = null; parts.tag = word.slice(1, -1); continue; }
    if ((value = parseTime(word))) { locationWords = null; parts.times.push(value); continue; }
    if ((value = parseDate(word))) { locationWords = null; parts.dates.push(value); continue; }
    if (word.startsWith('@')) { locationWords = [word.slice(1)]; parts.location = ''; continue; }

    (locationWords || parts.title).push(word);
    if (locationWords) parts.location = locationWords.filter(Boolean).join(' ');
  }
  if (locationWords) parts.location = locationWords.filter(Boolean).join(' ');
  parts.title = parts.title.filter(Boolean).join(' ');
  return parts;
}

function parseCommandParts(text) {
  const parts = parseParts(text);
  if (parts.travelUnclear) throw new Error('how long is the travel? e.g. travel 30 (minutes) or travel 1h15');
  if (parts.returnUnclear) throw new Error('how long is the way back? e.g. return 20 (minutes) or return 1h');
  return parts;
}

const BOX_CHARACTERS = {
  solid:  ['┌', '┐', '└', '┘', '─', '│'],
  dashed: ['┌', '┐', '└', '┘', '╌', '╎'],
  dotted: ['┌', '┐', '└', '┘', '┄', '┆'],
  double: ['╔', '╗', '╚', '╝', '═', '║'],
  thick:  ['┏', '┓', '┗', '┛', '━', '┃'],
};
const BORDER_STYLES = Object.keys(BOX_CHARACTERS);
const REPEAT_WORDS = { daily: 'every day', weekly: 'every week', monthly: 'every month', yearly: 'every year' };
const BUCKET_BOXES = { open: '[ ]', completed: '[✓]', failed: '[X]' };

const categoryById = id => state.data.categories.find(category => category.id == id);
const categoryByTag = tag => state.data.categories.find(category => category.tag.toLowerCase() === String(tag).toLowerCase());
const planById = id => state.data.plans.find(plan => plan.id == id);
const exceptionsOf = plan => state.data.exceptions.filter(exception => exception.plan_id == plan.id);
const tagText = category => category ? `[${category.tag}] ` : '';
const dueText = deadline => deadline ? `due ${fullDate(deadline)}` : 'no deadline';
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

function occursOn(plan, date) {
  if (date < plan.date || (plan.until_date && date > plan.until_date)) return false;
  switch (plan.repeat_type) {
    case 'weekly':  return weekdayIndex(date) === weekdayIndex(plan.date);
    case 'monthly': return dayOfMonth(date) === Math.min(dayOfMonth(plan.date), daysInMonth(date));
    case 'yearly':  return date.slice(5) === plan.date.slice(5);
    default:        return date === plan.date;
  }
}

const isAllDay = plan => +plan.all_day === 1;
const daysBetween = (fromDate, toDate) => Math.round((toDateObject(toDate) - toDateObject(fromDate)) / 86400000);
const extraDays = plan => isAllDay(plan) && plan.end_date ? daysBetween(plan.date, plan.end_date) : 0;

function occurrences(fromDate, toDate) {
  const found = [];
  for (const plan of state.data.plans) {
    const exceptions = exceptionsOf(plan);
    const span = extraDays(plan);
    const addFrom = (firstDate, details) => {
      for (let offset = 0; offset <= span; offset++) {
        const date = addDays(firstDate, offset);
        if (date < fromDate || date > toDate) continue;
        found.push({ plan, date, allDay: isAllDay(plan), firstDate, dayNumber: offset + 1, dayCount: span + 1, ...details });
      }
    };
    for (let date = addDays(fromDate, -span); date <= toDate; date = addDays(date, 1)) {
      const changedThatDay = exceptions.some(exception => exception.date === date);
      if (occursOn(plan, date) && !changedThatDay) addFrom(date, { start: plan.start_time, end: plan.end_time });
    }
    for (const exception of exceptions) {
      if (exception.new_date) addFrom(exception.new_date, { start: exception.new_start, end: exception.new_end, movedFrom: exception.date });
    }
  }
  return found.sort((first, second) => (first.date + first.start).localeCompare(second.date + second.start));
}

function upcomingDates(plan, count = 5) {
  const dates = [];
  const exceptions = exceptionsOf(plan);
  for (let date = today(), daysChecked = 0; dates.length < count && daysChecked < 800; date = addDays(date, 1), daysChecked++) {
    if (occursOn(plan, date) && !exceptions.some(exception => exception.date === date)) dates.push(date);
  }
  return dates;
}

function describeWhen(plan) {
  const days = extraDays(plan) + 1;
  const time = isAllDay(plan) ? (days > 1 ? `all day, ${days} days` : 'all day') : `${plan.start_time}–${plan.end_time}`;
  const until = plan.until_date ? ` until ${fullDate(plan.until_date)}` : '';
  switch (plan.repeat_type) {
    case 'weekly':  return `every ${DAY_NAMES[weekdayIndex(plan.date)]} from ${fullDate(plan.date)}${until}, ${time}`;
    case 'monthly': return `every month on the ${ordinal(dayOfMonth(plan.date))} from ${fullDate(plan.date)}${until}, ${time}`;
    case 'yearly':  return `every year on ${shortDate(plan.date)} from ${yearOf(plan.date)}${until}, ${time}`;
    default:
      if (days > 1) return `${fullDate(plan.date)} – ${fullDate(plan.end_date)}, all day`;
      return `${fullDate(plan.date)}, ${time}`;
  }
}

function noteLines(notes) {
  return String(notes || '').split('\n').filter(Boolean);
}

const isChecklistNote = note => /^\[[ x]\] /.test(note);

function toggleNote(notes, noteNumber) {
  const lines = noteLines(notes);
  const note = lines[noteNumber - 1];
  if (note === undefined) throw new Error(`there is no note ${noteNumber}`);
  if (!isChecklistNote(note)) throw new Error(`note ${noteNumber} is not a checklist item. make one with -- [ ] text`);
  lines[noteNumber - 1] = note.startsWith('[x] ') ? '[ ] ' + note.slice(4) : '[x] ' + note.slice(4);
  return lines.join('\n');
}

const returnHomeAt = (end, returnMinutes) => toTime(Math.min(MINUTES_PER_DAY, toMinutes(end) + returnMinutes));

function frequentTimes() {
  const timesUsed = {};
  for (const plan of state.data.plans) {
    const time = `${plan.start_time}-${plan.end_time}`;
    timesUsed[time] = (timesUsed[time] || 0) + 1;
  }
  const mostUsed = Object.keys(timesUsed).sort((first, second) => timesUsed[second] - timesUsed[first]).slice(0, 3);
  for (const common of ['09:00-10:00', '12:00-13:00', '19:00-20:00']) {
    if (mostUsed.length < 3 && !mostUsed.includes(common)) mostUsed.push(common);
  }
  return mostUsed;
}

async function callServer(action, payload = {}) {
  let answer;
  try {
    const response = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF': APP.csrf, 'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || '' },
      body: JSON.stringify({ action, ...payload }),
    });
    answer = await response.json();
  } catch {
    throw new Error('could not reach the server, check your connection');
  }
  if (answer.error) throw new Error(answer.error);
  if (answer.state) {
    state.data = answer.state;
    render();
  }
  return answer;
}

function print(text, style = '') {
  const line = document.createElement('div');
  line.className = 'line ' + style;
  line.textContent = text;
  (state.printTarget || ui.output).appendChild(line);
  while (ui.output.children.length > 200) ui.output.firstChild.remove();
  ui.output.scrollTop = ui.output.scrollHeight;
  return line;
}
const printSuccess = text => print('✓ ' + text, 'ok');
const printError = text => print('✗ ' + text, 'err');

function confirmThen(previewLines, onYes) {
  [].concat(previewLines).forEach(line => print(line, 'preview'));
  state.pendingConfirm = onYes;
  refreshPrompt();
}

function rememberUndo(label, whatItDoes, takeBack) {
  state.undo = { label, what: whatItDoes, run: takeBack };
}

function markAnswerStart() {
  state.answerStart = ui.output.lastElementChild;
}
function scrollToAnswer() {
  const firstLine = state.answerStart ? state.answerStart.nextElementSibling : ui.output.firstElementChild;
  if (!firstLine) return;
  const lastLine = ui.output.lastElementChild;
  const answerHeight = lastLine.offsetTop + lastLine.offsetHeight - firstLine.offsetTop;
  if (answerHeight > ui.output.clientHeight) ui.output.scrollTop = firstLine.offsetTop - 4;
}

const outputLineHeight = () => parseFloat(getComputedStyle(ui.output).lineHeight) || 20;

function setOutputHeight(pixels, save = true) {
  const tallest = innerHeight * 0.75;
  pixels = Math.round(Math.max(0, Math.min(pixels, tallest)));
  ui.output.style.height = pixels + 'px';
  ui.grip.setAttribute('aria-valuenow', pixels);
  if (save) {
    try { localStorage.setItem('outHeight', pixels); } catch {  }
  }
}

function resetOutputHeight() {
  ui.output.style.height = '';
  try { localStorage.removeItem('outHeight'); } catch {  }
}

ui.grip.addEventListener('pointerdown', downEvent => {
  downEvent.preventDefault();
  ui.grip.setPointerCapture(downEvent.pointerId);
  ui.grip.classList.add('active');
  const startY = downEvent.clientY;
  const startHeight = ui.output.offsetHeight;

  const onMove = moveEvent => setOutputHeight(startHeight + (startY - moveEvent.clientY), false);
  const onRelease = () => {
    ui.grip.removeEventListener('pointermove', onMove);
    ui.grip.removeEventListener('pointerup', onRelease);
    ui.grip.removeEventListener('pointercancel', onRelease);
    ui.grip.classList.remove('active');
    setOutputHeight(ui.output.offsetHeight);
    ui.output.scrollTop = ui.output.scrollHeight;
  };
  ui.grip.addEventListener('pointermove', onMove);
  ui.grip.addEventListener('pointerup', onRelease);
  ui.grip.addEventListener('pointercancel', onRelease);
});

ui.grip.addEventListener('dblclick', resetOutputHeight);

ui.grip.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp') { event.preventDefault(); setOutputHeight(ui.output.offsetHeight + outputLineHeight()); }
  else if (event.key === 'ArrowDown') { event.preventDefault(); setOutputHeight(ui.output.offsetHeight - outputLineHeight()); }
  else if (event.key === 'Home') { event.preventDefault(); resetOutputHeight(); }
});

try {
  const savedHeight = localStorage.getItem('outHeight');
  if (savedHeight !== null) setOutputHeight(+savedHeight, false);
} catch {  }

function planIdFrom(word) {
  const id = parseInt(String(word || '').replace('#', ''), 10);
  if (!planById(id)) {
    throw new Error(word ? `there is no plan #${String(word).replace('#', '')}` : 'which plan? give its number, e.g. 12');
  }
  return id;
}

function requireCategoryTag(tag) {
  if (tag === null) return null;
  const category = categoryByTag(tag);
  if (!category) throw new Error(`unknown category [${tag}]. see them with cat ls, or create it with cat add`);
  return category.tag;
}


function safeTypedDate(date) {
  return parseDate(typedDate(date)) === date ? typedDate(date) : date;
}

function travelSummary(plan) {
  const travel = +plan.travel_minutes || 0;
  const back = +plan.return_minutes || 0;
  let text = '';
  if (travel) text += `, ${travelText(travel)} travel (leave at ${leaveAt(plan.start_time, travel)})`;
  if (back) text += `, ${travelText(back)} back (home at ${returnHomeAt(plan.end_time, back)})`;
  return text;
}

function planPreview(plan) {
  const category = plan.tag ? categoryByTag(plan.tag) : categoryById(plan.category_id);
  const place = plan.location ? ' @' + plan.location : '';
  const notes = noteLines(plan.notes).map(note => ' -- ' + note).join('');
  return `${tagText(category)}${plan.title}, ${describeWhen(plan)}${place}${travelSummary(plan)}${notes}`;
}

function planFieldsFromParts(parts, commandName) {
  if (!parts.title) throw new Error(`${commandName} needs a title, e.g. ${commandName} Gym tue 19:00-20:00`);
  if (parts.allDay) {
    if (parts.times.length) throw new Error('an all day plan has no time. remove the time or "all day"');
    if (parts.dates.length > 2) throw new Error('all day takes a first and a last day, e.g. 20-12 03-01 all day');
  } else {
    if (!parts.times.length) throw new Error(`${commandName} needs a time, e.g. 19:00-20:00 (or 19:00 for one hour, or all day)`);
    if (parts.dates.length > 1) throw new Error('several days only work with all day, e.g. add Holiday 20-12 03-01 all day');
    if (parts.times.length > 1) throw new Error(`${commandName} takes one time`);
  }
  const date = parts.dates[0] || today();
  const lastDate = parts.allDay && parts.dates[1] ? parts.dates[1] : null;
  if (lastDate && lastDate < date) throw new Error(`the last day (${fullDate(lastDate)}) is before the first day (${fullDate(date)})`);

  const fields = {
    title: parts.title,
    tag: requireCategoryTag(parts.tag),
    location: parts.location || '',
    notes: parts.notes || '',
    date,
    end_date: lastDate && lastDate !== date ? lastDate : null,
    all_day: parts.allDay ? 1 : 0,
    start_time: parts.allDay ? '00:00' : parts.times[0][0],
    end_time: parts.allDay ? '24:00' : parts.times[0][1],
    repeat_type: 'none',
    travel_minutes: parts.travel || 0,
    return_minutes: parts.returnTravel || 0,
  };

  if (parts.every === null) return [fields];
  const every = parseEvery(parts.every);
  if (!every) throw new Error(`"every ${parts.every}" is unclear. try every tue, every sat,sun, every day, every month or every year`);
  if (every === 'year') return [{ ...fields, repeat_type: 'yearly' }];
  if (every === 'month') return [{ ...fields, repeat_type: 'monthly' }];
  const weekdays = every === 'week' ? [weekdayIndex(date)] : every;
  return weekdays.map(weekday => {
    const firstDate = nextWeekday(date, weekday);
    const shift = daysBetween(date, firstDate);
    return { ...fields, date: firstDate, end_date: fields.end_date && addDays(fields.end_date, shift), repeat_type: 'weekly' };
  });
}

function currentPlanFields(plan) {
  const category = categoryById(plan.category_id);
  return {
    title: plan.title, tag: category ? category.tag : null, location: plan.location, notes: plan.notes,
    date: plan.date, end_date: plan.end_date || null, all_day: +plan.all_day || 0,
    start_time: plan.start_time, end_time: plan.end_time, repeat_type: plan.repeat_type, until_date: plan.until_date || null,
    travel_minutes: +plan.travel_minutes || 0, return_minutes: +plan.return_minutes || 0,
  };
}

function quoteIfNeeded(text, readsBackAs) {
  return readsBackAs(text) === text && !NOTE_SEPARATOR.test(` ${text} `) ? text : `"${text.replace(/"/g, '')}"`;
}

function planAsCommand(plan) {
  const category = categoryById(plan.category_id);
  const words = [quoteIfNeeded(plan.title, text => parseParts(text).title), safeTypedDate(plan.date)];
  if (isAllDay(plan)) {
    if (plan.end_date) words.push(safeTypedDate(plan.end_date));
    words.push('all day');
  } else {
    words.push(`${plan.start_time}-${plan.end_time}`);
  }
  if (category) words.push(`[${category.tag}]`);
  if (plan.repeat_type === 'weekly') words.push(`every ${DAY_NAMES[weekdayIndex(plan.date)]}`);
  if (plan.repeat_type === 'monthly') words.push('every month');
  if (plan.repeat_type === 'yearly') words.push('every year');
  if (plan.location) {
    const asTyped = parseParts('@' + plan.location).location === plan.location;
    words.push(asTyped ? '@' + plan.location : `@ "${plan.location.replace(/"/g, '')}"`);
  }
  if (+plan.travel_minutes) words.push(`travel ${plan.travel_minutes}`);
  if (+plan.return_minutes) words.push(`return ${plan.return_minutes}`);
  return words.join(' ') + noteLines(plan.notes).map(note => ' -- ' + note).join('');
}

function prefillInput(text, fullEdit) {
  ui.input.value = text;
  state.fullEdit = fullEdit;
  print('change anything and press Enter. what you remove from the line is removed.', 'dim');
  ui.input.focus();
  ui.input.setSelectionRange(text.length, text.length);
}

function takeFullEdit(kind, id) {
  const fullEdit = state.activeFullEdit;
  return Boolean(fullEdit && fullEdit.kind === kind && String(fullEdit.id) === String(id));
}

async function restoreExceptions(planId, exceptions) {
  for (const exception of exceptions) {
    await callServer('exception_restore', { id: planId, date: exception.date, previous: exception });
  }
}

const COMMANDS = {};

COMMANDS.add = {
  group: 'agenda', desc: 'add a plan', ex: 'add Gym tue 19:00-20:00 [S]',
  usage: 'add <title> <day> <time> [tag] every <day> @<place> travel <min> return <min> -- <note> -- <note>',
  details: [
    'day:    today, tomorrow, tue, 18-11, 18-11-2027 (default: today)',
    'time:   19:00-20:00, or 19:00 for one hour, or all day',
    'days:   20-12 03-01 all day   (a first and last day, for holidays)',
    'tag:    a category tag in brackets, like [W]',
    'repeat: every tue, every sat,sun (one series per day), every day, every month, every year',
    'place:  @ followed by the place, like @Main St 4',
    'travel: travel 30 (minutes there), return 20 (minutes back), like 1h15 or 45',
    'notes:  every -- starts a new note. start one with - for a bullet, 1. for a number, [ ] for a checklist',
    'put a title in "quotes" if it contains a day name: add "Sunday lunch" sun 13:00',
  ],
  run(args) {
    const parts = parseCommandParts(args);
    const newPlans = planFieldsFromParts(parts, 'add');
    confirmThen([...newPlans.map(plan => 'add ' + planPreview(plan)), 'save? (y/n)'], async () => {
      const newIds = [];
      for (const plan of newPlans) newIds.push((await callServer('plan_add', plan)).id);
      rememberUndo(`add ${parts.title}`, `removes ${parts.title} again`, async () => {
        for (const id of newIds) await callServer('plan_rm', { id });
      });
      if (newPlans.length === 1) {
        state.cursor = newPlans[0].date;
        render();
      }
      printSuccess(newPlans.length > 1 ? `added ${newPlans.length} series, one per day` : `added ${parts.title}`);
    });
  },
};

COMMANDS.show = {
  group: 'agenda', desc: 'show everything about a plan', ex: 'show 12', usage: 'show <number>',
  run(args) {
    const plan = planById(planIdFrom(args));
    const category = categoryById(plan.category_id);
    const travel = +plan.travel_minutes;
    const back = +plan.return_minutes;

    const block = document.createElement('div');
    block.className = 'block';
    block.dataset.show = plan.id;
    ui.output.appendChild(block);
    state.printTarget = block;

    print(`#${plan.id} ${tagText(category)}${plan.title}`, 'strong');
    print(`  when   ${describeWhen(plan)}`);
    if (category) print(`  type   ${category.name}`);
    if (plan.location) print(`  where  ${plan.location}`);
    if (travel) print(`  travel ${travelText(travel)}, leave at ${leaveAt(plan.start_time, travel)}`);
    if (back) print(`  return ${travelText(back)}, home at ${returnHomeAt(plan.end_time, back)}`);
    noteLines(plan.notes).forEach((note, index) => print(`  note ${index + 1} ${note}`));
    for (const exception of exceptionsOf(plan)) {
      print(exception.new_date
        ? `  moved  ${fullDate(exception.date)} to ${fullDate(exception.new_date)}, ${exception.new_start}–${exception.new_end}`
        : `  skip   ${fullDate(exception.date)}`);
    }
    state.printTarget = null;
  },
};

COMMANDS.edit = {
  group: 'agenda', desc: 'change a plan', ex: 'edit 12',
  usage: 'edit <number>   (or: edit <number> <only the parts to change>)',
  details: [
    'edit 12 puts the whole plan in the prompt. change anything and press Enter.',
    'in that full line, what you remove is removed too (a place, a note, travel...).',
    'edit 12 11:00-12:00 changes only what you type, using the same shorthand as add.',
    'on a repeating plan this changes every date of the series.',
  ],
  run(args) {
    const [idWord, ...rest] = args.split(/\s+/);
    const plan = planById(planIdFrom(idWord));
    if (!rest.length) return prefillInput(`edit ${plan.id} ${planAsCommand(plan)}`, { kind: 'plan', id: plan.id });

    const parts = parseCommandParts(rest.join(' '));
    const before = currentPlanFields(plan);
    const exceptionsBefore = exceptionsOf(plan).map(exception => ({ ...exception }));
    let changes;
    let summary;

    if (takeFullEdit('plan', plan.id)) {
      const replaced = planFieldsFromParts(parts, 'edit');
      if (replaced.length > 1) throw new Error('one plan can repeat on one day. for more days, add another plan');
      changes = { ...replaced[0], until_date: before.until_date };
      summary = planPreview(changes);
    } else {
      changes = {};
      const described = [];
      if (parts.title) { changes.title = parts.title; described.push(`title: ${parts.title}`); }
      if (parts.dates.length) { changes.date = parts.dates[0]; described.push(`date: ${fullDate(parts.dates[0])}`); }
      if (parts.times.length) {
        [changes.start_time, changes.end_time] = parts.times[0];
        changes.all_day = 0;
        changes.end_date = null;
        described.push(`time: ${parts.times[0].join('–')}`);
      }
      if (parts.allDay) { changes.all_day = 1; described.push('all day'); }
      if (parts.tag !== null) { changes.tag = requireCategoryTag(parts.tag); described.push(`category: [${changes.tag}]`); }
      if (parts.location !== null) { changes.location = parts.location; described.push(`place: ${parts.location || '(none)'}`); }
      if (parts.notes !== null) { changes.notes = parts.notes; described.push(`notes: ${noteLines(parts.notes).join(' / ') || '(none)'}`); }
      if (parts.travel !== null) { changes.travel_minutes = parts.travel; described.push(parts.travel ? `travel: ${travelText(parts.travel)}` : 'no travel'); }
      if (parts.returnTravel !== null) { changes.return_minutes = parts.returnTravel; described.push(parts.returnTravel ? `return: ${travelText(parts.returnTravel)}` : 'no return travel'); }
      if (parts.every !== null) throw new Error(`to change how it repeats, type edit ${plan.id} and change the full line`);
      if (!described.length) throw new Error(`nothing to change. type edit ${plan.id} to get the whole plan in the prompt`);
      summary = described.join(', ');
    }

    confirmThen([`edit #${plan.id}: ${summary}`, 'save? (y/n)'], async () => {
      await callServer('plan_edit', { id: plan.id, fields: changes });
      rememberUndo(`edit #${plan.id}`, `puts #${plan.id} back as it was`, async () => {
        await callServer('plan_edit', { id: plan.id, fields: before });
        await restoreExceptions(plan.id, exceptionsBefore);
      });
      printSuccess(`changed #${plan.id}`);
    });
  },
};

COMMANDS.copy = {
  group: 'agenda', desc: 'copy a plan to another day', ex: 'copy 12 fri',
  usage: 'copy <number> <day> [time]',
  details: ['the copy happens once, with the same time, place, travel and notes.', 'give a time to change it: copy 12 fri 10:00-11:00'],
  run(args) {
    const [idWord, ...rest] = args.split(/\s+/);
    const plan = planById(planIdFrom(idWord));
    const parts = parseCommandParts(rest.join(' '));
    if (!parts.dates.length) throw new Error(`to which day? e.g. copy ${plan.id} fri`);
    const copy = { ...currentPlanFields(plan), date: parts.dates[0], repeat_type: 'none', until_date: null };
    if (copy.end_date) copy.end_date = addDays(parts.dates[0], extraDays(plan));
    if (parts.times.length) {
      [copy.start_time, copy.end_time] = parts.times[0];
      copy.all_day = 0;
      copy.end_date = null;
    }
    confirmThen([`copy to: ${planPreview(copy)}`, 'save? (y/n)'], async () => {
      const { id } = await callServer('plan_add', copy);
      rememberUndo(`copy #${plan.id}`, 'removes the copy again', () => callServer('plan_rm', { id }));
      state.cursor = copy.date;
      render();
      printSuccess(`copied to #${id} on ${fullDate(copy.date)}`);
    });
  },
};

COMMANDS.tick = {
  group: 'agenda', desc: 'tick a checklist note on or off', ex: 'tick 12 2', usage: 'tick <number> <note number>',
  details: ['notes that start with [ ] are a checklist. show 12 lists the note numbers.', 'you can also click the [ ] in the agenda.'],
  async run(args) {
    const [idWord, noteWord] = args.split(/\s+/);
    const plan = planById(planIdFrom(idWord));
    if (!noteWord) throw new Error(`which note? e.g. tick ${plan.id} 1 (show ${plan.id} lists them)`);
    const notes = toggleNote(plan.notes, parseInt(noteWord, 10));
    const before = plan.notes;
    await callServer('plan_edit', { id: plan.id, fields: { notes } });
    rememberUndo(`tick ${plan.id} ${noteWord}`, 'sets the note back', () => callServer('plan_edit', { id: plan.id, fields: { notes: before } }));
    const note = noteLines(notes)[parseInt(noteWord, 10) - 1];
    printSuccess(note);
  },
};

COMMANDS.rm = {
  group: 'agenda', desc: 'remove a plan', ex: 'rm 12', usage: 'rm <number> [day]',
  details: ['rm 12 removes the plan (a whole series if it repeats).', 'rm 12 21-11 removes only that date of a series (same as skip).'],
  run(args) {
    const [idWord, dateWord] = args.split(/\s+/);
    if (dateWord) return COMMANDS.skip.run(args);
    const plan = planById(planIdFrom(idWord));
    const question = plan.repeat_type === 'none'
      ? `remove #${plan.id} ${plan.title} on ${fullDate(plan.date)}? (y/n)`
      : `remove the whole series #${plan.id} ${plan.title}, past dates too? (y/n)\n  tip: skip removes one date, stop ends the series and keeps the past`;

    confirmThen(question, async () => {
      const removedPlan = { ...plan };
      const removedExceptions = exceptionsOf(plan).map(exception => ({ ...exception }));
      await callServer('plan_rm', { id: plan.id });
      rememberUndo(`rm #${plan.id}`, `brings back #${plan.id} ${plan.title}`,
        () => callServer('plan_restore', { plan: removedPlan, exceptions: removedExceptions }));
      printSuccess(`removed #${plan.id} ${plan.title}`);
    });
  },
};

COMMANDS.skip = {
  group: 'agenda', desc: 'skip one date of a series', ex: 'skip 12 21-11', usage: 'skip <number> <day>',
  run(args) {
    const [idWord, dateWord] = args.split(/\s+/);
    const plan = planById(planIdFrom(idWord));
    if (plan.repeat_type === 'none') throw new Error(`#${plan.id} doesn't repeat, use rm ${plan.id} instead`);
    const date = dateWord && parseDate(dateWord);
    if (!date) throw new Error(`which date? e.g. skip ${plan.id} ${typedDate(upcomingDates(plan, 1)[0] || today())}`);
    if (!occursOn(plan, date)) throw new Error(`#${plan.id} doesn't happen on ${fullDate(date)}`);

    confirmThen(`skip #${plan.id} ${plan.title} on ${fullDate(date)}? (y/n)`, async () => {
      const previous = exceptionsOf(plan).find(exception => exception.date === date) || null;
      await callServer('skip', { id: plan.id, date });
      rememberUndo(`skip #${plan.id} ${typedDate(date)}`, `puts ${fullDate(date)} back`,
        () => callServer('exception_restore', { id: plan.id, date, previous }));
      printSuccess(`skipped ${fullDate(date)}`);
    });
  },
};

COMMANDS.move = {
  group: 'agenda', desc: 'move one date of a series', ex: 'move 12 21-11 22-11 10:00-11:00',
  usage: 'move <number> <from day> <to day> [time]',
  details: ['without a time the plan keeps its usual time.', 'to move a plan that does not repeat, use edit.'],
  run(args) {
    const [idWord, ...rest] = args.split(/\s+/);
    const plan = planById(planIdFrom(idWord));
    if (plan.repeat_type === 'none') throw new Error(`#${plan.id} doesn't repeat, use edit ${plan.id} <day> <time> instead`);
    const parts = parseCommandParts(rest.join(' '));
    if (parts.dates.length < 2) throw new Error(`give the old and the new date, e.g. move ${plan.id} 21-11 22-11`);
    const [fromDate, toDate] = parts.dates;
    if (!occursOn(plan, fromDate)) throw new Error(`#${plan.id} doesn't happen on ${fullDate(fromDate)}`);
    const [start, end] = parts.times[0] || [plan.start_time, plan.end_time];

    confirmThen(`move #${plan.id} ${plan.title} from ${fullDate(fromDate)} to ${fullDate(toDate)}, ${start}–${end}? (y/n)`, async () => {
      const previous = exceptionsOf(plan).find(exception => exception.date === fromDate) || null;
      await callServer('move', { id: plan.id, date: fromDate, new_date: toDate, new_start: start, new_end: end });
      rememberUndo(`move #${plan.id}`, `puts ${fullDate(fromDate)} back`,
        () => callServer('exception_restore', { id: plan.id, date: fromDate, previous }));
      state.cursor = toDate;
      render();
      printSuccess(`moved to ${fullDate(toDate)}`);
    });
  },
};

COMMANDS.stop = {
  group: 'agenda', desc: 'end a repeating series', ex: 'stop 12', usage: 'stop <number> [last day]',
  details: ['the series ends after the last day (default: today). past dates stay visible.'],
  run(args) {
    const [idWord, dateWord] = args.split(/\s+/);
    const plan = planById(planIdFrom(idWord));
    if (plan.repeat_type === 'none') throw new Error(`#${plan.id} doesn't repeat`);
    const lastDate = dateWord ? parseDate(dateWord) : today();
    if (!lastDate) throw new Error(`"${dateWord}" is not a date`);

    confirmThen(`end #${plan.id} ${plan.title} after ${fullDate(lastDate)}? later dates disappear, earlier ones stay. (y/n)`, async () => {
      const previousEnd = plan.until_date || null;
      await callServer('stop', { id: plan.id, until: lastDate });
      rememberUndo(`stop #${plan.id}`, `lets #${plan.id} continue again`,
        () => callServer('plan_edit', { id: plan.id, fields: { until_date: previousEnd } }));
      printSuccess(`#${plan.id} ends after ${fullDate(lastDate)}`);
    });
  },
};

COMMANDS.view = {
  group: 'view', desc: 'switch view: d, 3, w or m', ex: 'view w', usage: 'view d | 3 | w | m',
  details: ['d = day, 3 = three days, w = week, m = month', 'you can also just type d, 3, w or m'],
  run(args) {
    const view = args.trim().toLowerCase();
    if (!['d', '3', 'w', 'm'].includes(view)) throw new Error('view takes d (day), 3 (three days), w (week) or m (month)');
    state.view = view;
    render();
  },
};

COMMANDS.today = {
  group: 'view', desc: 'jump to today', ex: 'today', usage: 'today',
  run() {
    state.cursor = today();
    if (isListView()) state.view = 'w';
    render();
  },
};

COMMANDS.next = { group: 'view', desc: 'go forward', ex: 'next', usage: 'next', run() { moveInTime(1); } };
COMMANDS.prev = { group: 'view', desc: 'go back', ex: 'prev', usage: 'prev', run() { moveInTime(-1); } };

function moveInTime(direction) {
  if (isListView()) state.view = 'w';
  if (state.view === 'm') state.cursor = addMonths(state.cursor, direction);
  else state.cursor = addDays(state.cursor, direction * { d: 1, 3: 3, w: 7 }[state.view]);
  render();
}

COMMANDS.goto = {
  group: 'view', desc: 'jump to a day, week or month', ex: 'goto week 48',
  usage: 'goto <day> | goto week <n> [year] | goto <month> [year]',
  details: [
    'a day opens the day view:     goto 24-12, goto fri, goto 2027-01-05',
    'a week opens the week view:   goto week 48, goto wk 2 2027, goto w48',
    'a month opens the month view: goto dec, goto december 2027, goto 12-2027',
    'a year opens january:         goto 2027',
  ],
  run(args) {
    const text = args.trim().toLowerCase();
    const thisYear = yearOf(today());

    let match = text.match(/^(?:week|wk|w)\s*(\d{1,2})(?:\s+(\d{4}))?$/);
    if (match) {
      const week = +match[1];
      const year = match[2] ? +match[2] : thisYear;
      const monday = addDays(mondayOf(`${year}-01-04`), (week - 1) * 7);
      if (week < 1 || isoWeek(monday) !== week) throw new Error(`${year} has no week ${week}`);
      state.cursor = monday;
      state.view = 'w';
      render();
      const sunday = addDays(monday, 6);
      return printSuccess(`week ${week}, ${shortDate(monday)} – ${shortDate(sunday)} ${yearOf(sunday)}`);
    }

    let month = null;
    let year = null;
    if ((match = text.match(/^([a-z]{3,})(?:\s+(\d{4}))?$/))) {
      const monthIndex = FULL_MONTH_NAMES.findIndex(name => name.startsWith(match[1]));
      if (monthIndex >= 0) { month = monthIndex + 1; year = match[2] ? +match[2] : null; }
    }
    else if ((match = text.match(/^(\d{1,2})[-/](\d{4})$/))) { month = +match[1]; year = +match[2]; }
    else if ((match = text.match(/^(\d{4})[-/](\d{1,2})$/))) { month = +match[2]; year = +match[1]; }
    else if ((match = text.match(/^(\d{4})$/))) { month = 1; year = +match[1]; }

    if (month !== null) {
      if (month < 1 || month > 12) throw new Error(`${month} is not a month`);
      if (year === null) {
        year = thisYear;
        if (`${year}-${twoDigits(month)}` < addMonths(today(), -6).slice(0, 7)) year++;
      }
      state.cursor = `${year}-${twoDigits(month)}-01`;
      state.view = 'm';
      render();
      return printSuccess(`${FULL_MONTH_NAMES[month - 1]} ${year}`);
    }

    const date = parseDate(text);
    if (!date) throw new Error(`"${args.trim()}" isn't a day, week or month. try goto 24-12, goto week 48 or goto dec`);
    state.cursor = date;
    state.view = 'd';
    render();
  },
};

COMMANDS.cat = {
  group: 'categories', desc: 'categories: add, ls, edit, rm', ex: 'cat ls',
  usage: 'cat add <name> <tag> <border> | cat ls | cat edit <tag> | cat rm <tag>',
  details: [
    'cat add Work W dashed  makes a category shown as [W] with a dashed border',
    'cat edit W  puts the category in the prompt to change its name, tag or border',
    'borders: solid, dashed, dotted, double, thick',
    'removing a category keeps its plans; they just have no category anymore',
  ],
  sub: {
    add: { desc: 'new category', ex: 'cat add Work W dashed' },
    ls: { desc: 'list categories', ex: 'cat ls' },
    edit: { desc: 'change name, tag or border', ex: 'cat edit W' },
    rm: { desc: 'remove a category', ex: 'cat rm W' },
  },
  run(args) {
    const [subCommand, ...rest] = args.split(/\s+/).filter(Boolean);
    const plansIn = category => state.data.plans.filter(plan => plan.category_id == category.id);

    if (subCommand === 'ls' || !subCommand) {
      if (!state.data.categories.length) return print('no categories yet. make one: cat add Work W dashed', 'dim');
      for (const category of state.data.categories) {
        const side = BOX_CHARACTERS[category.border][5];
        print(`${side}[${category.tag}]${side} ${category.name.padEnd(16)} ${category.border.padEnd(7)} ${plural(plansIn(category).length, 'plan')}`);
      }
      return;
    }

    if (subCommand === 'add') {
      if (rest.length < 3) throw new Error('cat add needs a name, a tag and a border, e.g. cat add Work W dashed');
      const border = rest.pop().toLowerCase();
      const tag = rest.pop().replace(/[[\]]/g, '');
      const name = rest.join(' ');
      if (!BORDER_STYLES.includes(border)) throw new Error('border must be solid, dashed, dotted, double or thick');
      confirmThen(`add category ${name} as [${tag}] with a ${border} border? (y/n)`, async () => {
        await callServer('cat_add', { name, tag, border });
        rememberUndo(`cat add ${tag}`, `removes [${tag}] again`, () => callServer('cat_rm', { tag }));
        printSuccess(`added [${tag}] ${name}`);
      });
      return;
    }

    if (subCommand === 'edit') {
      const category = categoryByTag((rest[0] || '').replace(/[[\]]/g, ''));
      if (!category) throw new Error('which category? e.g. cat edit W');
      if (rest.length === 1) return prefillInput(`cat edit ${category.tag} ${category.name} ${category.tag} ${category.border}`, { kind: 'cat', id: category.tag });
      const values = rest.slice(1);
      if (values.length < 3) throw new Error(`give a name, tag and border, e.g. cat edit ${category.tag} ${category.name} ${category.tag} double`);
      const border = values.pop().toLowerCase();
      const newTag = values.pop().replace(/[[\]]/g, '');
      const name = values.join(' ');
      if (!BORDER_STYLES.includes(border)) throw new Error('border must be solid, dashed, dotted, double or thick');
      confirmThen(`change [${category.tag}] ${category.name} (${category.border}) to [${newTag}] ${name} (${border})? (y/n)`, async () => {
        const before = { ...category };
        await callServer('cat_edit', { tag: category.tag, name, new_tag: newTag, border });
        rememberUndo(`cat edit ${category.tag}`, `changes [${newTag}] back to [${before.tag}] ${before.name}`,
          () => callServer('cat_edit', { tag: newTag, name: before.name, new_tag: before.tag, border: before.border }));
        printSuccess(`changed to [${newTag}] ${name}`);
      });
      return;
    }

    if (subCommand === 'rm') {
      const category = categoryByTag((rest[0] || '').replace(/[[\]]/g, ''));
      if (!category) throw new Error('which category? e.g. cat rm W');
      const usedBy = plansIn(category).length;
      const note = usedBy ? ` ${plural(usedBy, 'plan')} will have no category.` : '';
      confirmThen(`remove category [${category.tag}] ${category.name}?${note} (y/n)`, async () => {
        const removedCategory = { ...category };
        const planIds = plansIn(category).map(plan => plan.id);
        await callServer('cat_rm', { tag: category.tag });
        rememberUndo(`cat rm ${category.tag}`, `brings back [${category.tag}] ${category.name} on its plans`,
          () => callServer('cat_restore', { category: removedCategory, plan_ids: planIds }));
        printSuccess(`removed [${category.tag}]`);
      });
      return;
    }

    throw new Error('cat takes add, ls, edit or rm. see help cat');
  },
};

function todoById(word) {
  const todo = state.data.todos.find(item => item.id == String(word).replace('#', ''));
  if (!todo) throw new Error(`there is no to do #${String(word || '?').replace('#', '')}. see the numbers with todo`);
  return todo;
}

function todoRepeatFrom(everyWord) {
  if (everyWord === null) return undefined;
  if (everyWord === 'none' || everyWord === 'never') return 'none';
  const repeats = { day: 'daily', daily: 'daily', week: 'weekly', weekly: 'weekly', month: 'monthly', monthly: 'monthly', year: 'yearly', yearly: 'yearly' };
  if (!repeats[everyWord]) throw new Error('a to do can repeat every day, week, month or year');
  return repeats[everyWord];
}

const todoRepeatText = todo => todo.repeat_type && todo.repeat_type !== 'none' ? `, ${REPEAT_WORDS[todo.repeat_type]}` : '';

function takeOutNoDeadline(text) {
  const beforeNotes = text.split(/(^|\s)--(\s|$)/)[0];
  const phrase = /(^|\s)no\s+deadline(?=\s|$)/i;
  const found = phrase.test(beforeNotes);
  return { found, text: found ? text.replace(phrase, ' ').trim() : text };
}

function todoAsCommand(todo) {
  const words = [quoteIfNeeded(todo.title, text => parseParts(takeOutNoDeadline(text).text).title)];
  words.push(todo.deadline ? safeTypedDate(todo.deadline) : 'no deadline');
  if (todo.repeat_type && todo.repeat_type !== 'none') words.push(REPEAT_WORDS[todo.repeat_type]);
  return words.join(' ') + noteLines(todo.notes).map(note => ' -- ' + note).join('');
}

COMMANDS.todo = {
  group: 'to do', desc: 'open the to do list', ex: 'todo',
  usage: 'todo | todo add <title> <deadline> [every month] -- <note> | todo edit <n> | todo done <n> | todo tick <n> <note> | todo plan <n> <day> <time>',
  details: [
    'deadline: today, tomorrow, fri, 18-11, 18-11-2027, or type: no deadline',
    'repeat:   every day, every week, every month, every year (optional)',
    'to dos show up in the agenda on their deadline day.',
    'todo edit 3 puts the whole to do in the prompt; what you remove from that line is removed.',
    'or change only some parts: todo edit 3 fri every month (every none stops repeating, no deadline removes it)',
    'every -- starts a new note. - bullet, 1. number, [ ] checklist (todo tick 3 1, or click it)',
    'done removes the to do. a repeating one moves on to its next deadline instead.',
    'plan books time for it in the agenda: todo plan 3 fri 14:00-16:00 [W]. the to do stays until done.',
    'undo brings back what you last did, including a done to do.',
  ],
  sub: {
    add: { desc: 'add a to do with a deadline', ex: 'todo add Pay rent 01-12 every month' },
    edit: { desc: 'change it (the whole line in the prompt)', ex: 'todo edit 3' },
    tick: { desc: 'tick a checklist note on or off', ex: 'todo tick 3 1' },
    done: { desc: 'finish (removes it)', ex: 'todo done 3' },
    plan: { desc: 'book time for it in the agenda', ex: 'todo plan 3 fri 14:00-16:00' },
  },
  run(args) {
    const subCommand = args.split(/\s+/)[0].toLowerCase();
    const rest = args.slice(subCommand.length).trim();

    if (!subCommand) { state.view = 'todo'; render(); return; }
    if (subCommand === 'add') return this.add(rest);
    if (subCommand === 'edit') return this.edit(rest);
    if (subCommand === 'done') return this.done(rest);
    if (subCommand === 'plan') return this.plan(rest);
    if (subCommand === 'tick') return this.tick(rest);
    if (subCommand === 'undo') return COMMANDS.undo.run('');
    throw new Error('todo takes add, edit, done, tick or plan. see help todo');
  },

  add(text) {
    const noDeadline = takeOutNoDeadline(text);
    const parts = parseCommandParts(noDeadline.text);
    if (!parts.title) throw new Error('todo add needs a title and a deadline, e.g. todo add Pay rent fri');
    if (noDeadline.found && parts.dates.length) throw new Error('give a deadline or type no deadline, not both');
    if (!noDeadline.found && parts.dates.length !== 1) {
      throw new Error(`when is it due? e.g. todo add ${parts.title} fri. without a date, type: todo add ${parts.title} no deadline`);
    }
    if (noDeadline.found && parts.every !== null) throw new Error('a repeating to do needs a deadline');
    if (parts.times.length || parts.tag !== null || parts.location !== null || parts.travel !== null) {
      throw new Error('a to do has a title, a deadline, a repeat and notes. to book a time, use todo plan');
    }

    const todo = {
      title: parts.title,
      deadline: noDeadline.found ? null : parts.dates[0],
      notes: parts.notes || '',
      repeat_type: todoRepeatFrom(parts.every) || 'none',
    };
    const notes = noteLines(todo.notes).map(note => ' -- ' + note).join('');
    confirmThen([`todo ${todo.title}, ${dueText(todo.deadline)}${todoRepeatText(todo)}${notes}`, 'save? (y/n)'], async () => {
      const { id } = await callServer('todo_add', todo);
      rememberUndo(`todo add ${todo.title}`, `removes ${todo.title} again`, () => callServer('todo_rm', { id }));
      printSuccess(`added to do: ${todo.title}`);
    });
  },

  edit(text) {
    const [idWord, ...rest] = text.split(/\s+/).filter(Boolean);
    const todo = todoById(idWord);
    if (!rest.length) return prefillInput(`todo edit ${todo.id} ${todoAsCommand(todo)}`, { kind: 'todo', id: todo.id });
    const noDeadline = takeOutNoDeadline(rest.join(' '));
    const parts = parseCommandParts(noDeadline.text);
    if (noDeadline.found && parts.dates.length) throw new Error('give a deadline or type no deadline, not both');

    if (takeFullEdit('todo', todo.id)) {
      if (!parts.title) throw new Error('a to do needs a title');
      if (!noDeadline.found && parts.dates.length !== 1) throw new Error('give a deadline, or type: no deadline');
      if (noDeadline.found && parts.every !== null) throw new Error('a repeating to do needs a deadline');
      const replaced = {
        title: parts.title,
        deadline: noDeadline.found ? null : parts.dates[0],
        notes: parts.notes || '',
        repeat_type: todoRepeatFrom(parts.every) || 'none',
      };
      const notes = noteLines(replaced.notes).map(note => ' -- ' + note).join('');
      return confirmThen([`edit to do #${todo.id}: ${replaced.title}, ${dueText(replaced.deadline)}${todoRepeatText(replaced)}${notes}`, 'save? (y/n)'], async () => {
        const before = { ...todo };
        await callServer('todo_edit', { id: todo.id, fields: replaced });
        rememberUndo(`todo edit ${todo.id}`, `puts to do #${todo.id} back as it was`, () => callServer('todo_restore', { todo: before }));
        printSuccess(`changed to do #${todo.id}`);
      });
    }

    const changes = {};
    const described = [];
    if (parts.title) { changes.title = parts.title; described.push(`title: ${parts.title}`); }
    if (parts.dates.length) { changes.deadline = parts.dates[0]; described.push(`due: ${fullDate(parts.dates[0])}`); }
    if (noDeadline.found) { changes.deadline = null; described.push('no deadline'); }
    const repeat = todoRepeatFrom(parts.every);
    if (repeat) { changes.repeat_type = repeat; described.push(repeat === 'none' ? 'no longer repeats' : `repeats ${REPEAT_WORDS[repeat]}`); }
    if (parts.notes !== null) { changes.notes = parts.notes; described.push(`notes: ${noteLines(parts.notes).join(' / ') || '(none)'}`); }
    if (!described.length) throw new Error(`nothing to change. type todo edit ${todo.id} to get the whole to do in the prompt`);

    confirmThen([`edit to do #${todo.id} ${todo.title}: ${described.join(', ')}`, 'save? (y/n)'], async () => {
      const before = { ...todo };
      await callServer('todo_edit', { id: todo.id, fields: changes });
      rememberUndo(`todo edit ${todo.id}`, `puts to do #${todo.id} back as it was`, () => callServer('todo_restore', { todo: before }));
      printSuccess(`changed to do #${todo.id}`);
    });
  },

  async tick(text) {
    const [idWord, noteWord] = text.split(/\s+/);
    const todo = todoById(idWord);
    if (!noteWord) throw new Error(`which note? e.g. todo tick ${todo.id} 1`);
    const notes = toggleNote(todo.notes, parseInt(noteWord, 10));
    const before = { ...todo };
    await callServer('todo_edit', { id: todo.id, fields: { notes } });
    rememberUndo(`todo tick ${todo.id} ${noteWord}`, 'sets the note back', () => callServer('todo_restore', { todo: before }));
    printSuccess(noteLines(notes)[parseInt(noteWord, 10) - 1]);
  },

  async done(text) {
    const todo = todoById(text);
    const before = { ...todo };
    const answer = await callServer('todo_done', { id: todo.id });
    rememberUndo(`todo done ${todo.id}`, `puts ${todo.title} back on the list`, () => callServer('todo_restore', { todo: before }));
    printSuccess(answer.next
      ? `done: ${todo.title}. next one is due ${fullDate(answer.next)}`
      : `done: ${todo.title}. (undo brings it back)`);
  },

  plan(text) {
    const [idWord, ...rest] = text.split(/\s+/);
    const todo = todoById(idWord);
    const parts = parseCommandParts(rest.join(' '));
    const suggestedDate = !todo.deadline || todo.deadline < today() ? today() : todo.deadline;
    if (!parts.times.length) throw new Error(`when do you want to work on it? e.g. todo plan ${todo.id} ${typedDate(suggestedDate)} 14:00-16:00`);
    if (parts.every !== null) throw new Error('todo plan books one time. for repeating time, use add');
    const tag = requireCategoryTag(parts.tag);

    const newPlan = {
      title: todo.title, tag, date: parts.dates[0] || suggestedDate, repeat_type: 'none',
      start_time: parts.times[0][0], end_time: parts.times[0][1], location: parts.location || '', notes: todo.notes,
      travel_minutes: parts.travel || 0,
    };
    const late = todo.deadline && newPlan.date > todo.deadline ? ` (after the deadline, ${fullDate(todo.deadline)})` : '';

    confirmThen([
      `book ${tagText(tag && categoryByTag(tag))}${todo.title}, ${describeWhen(newPlan)}${late}`,
      'the to do stays on the list until you mark it done. save? (y/n)',
    ], async () => {
      const { id } = await callServer('plan_add', newPlan);
      rememberUndo(`todo plan ${todo.id}`, `removes the booked time again`, () => callServer('plan_rm', { id }));
      state.cursor = newPlan.date;
      if (isListView()) state.view = 'w';
      render();
      printSuccess(`booked #${id} ${todo.title} on ${fullDate(newPlan.date)}`);
    });
  },
};

COMMANDS.bucket = {
  group: 'bucket list', desc: 'open the bucket list', ex: 'bucket',
  usage: 'bucket | bucket add <title> -- <notes> | bucket done <n> | bucket fail <n>',
  details: ['items are permanent: they cannot be edited or removed.', 'done and fail are final.', 'go back to the agenda with view w (or d, 3, m)'],
  sub: {
    add: { desc: 'add an item (permanent!)', ex: 'bucket add Learn to sail' },
    done: { desc: 'mark completed (final)', ex: 'bucket done 2' },
    fail: { desc: 'mark failed (final)', ex: 'bucket fail 3' },
  },
  run(args) {
    const subCommand = args.split(/\s+/)[0].toLowerCase();
    const rest = args.slice(subCommand.length).trim();
    if (!subCommand) { state.view = 'bucket'; render(); return; }

    if (subCommand === 'add') {
      const notesStart = rest.search(/(^|\s)--(\s|$)/);
      const title = (notesStart >= 0 ? rest.slice(0, notesStart) : rest).trim();
      const notes = notesStart >= 0 ? splitNotes(rest.slice(notesStart)) : '';
      if (!title) throw new Error('bucket add needs a title, e.g. bucket add Learn to sail -- since I was a kid');
      const nextNumber = state.data.bucket.length + 1;
      confirmThen([
        `#${nextNumber} ${title}${noteLines(notes).map(note => '\n    ' + note).join('')}`,
        'this is permanent: it can never be edited or removed. add it? (y/n)',
      ], async () => {
        await callServer('bucket_add', { title, notes });
        state.undo = { label: `bucket add ${title}`, permanent: true };
        state.view = 'bucket';
        render();
        printSuccess(`added #${state.data.bucket.length} ${title}`);
      });
      return;
    }

    if (subCommand === 'done' || subCommand === 'fail') {
      const number = parseInt(rest.replace('#', ''), 10);
      const item = state.data.bucket.find(bucketItem => bucketItem.id == number);
      if (!item) throw new Error(`there is no bucket item #${rest || '?'}. see the numbers with bucket`);
      if (item.status !== 'open') throw new Error(`#${number} is already ${item.status}, that is final`);
      const status = subCommand === 'done' ? 'completed' : 'failed';
      confirmThen(`mark #${number} ${item.title} as ${status}? this is final. (y/n)`, async () => {
        await callServer('bucket_set', { id: number, status });
        state.undo = { label: `bucket ${subCommand} ${number}`, permanent: true };
        state.view = 'bucket';
        render();
        printSuccess(`#${number} ${status}`);
      });
      return;
    }

    throw new Error('bucket takes add, done or fail. see help bucket');
  },
};

function statsPeriod(text) {
  const words = text.trim().toLowerCase();
  const now = state.cursor || today();
  const week = monday => ({ from: monday, to: addDays(monday, 6), label: `week ${isoWeek(monday)} · ${shortDate(monday)}–${shortDate(addDays(monday, 6))} ${yearOf(addDays(monday, 6))}`, previous: 'last week', shift: from => addDays(from, -7) });
  const month = first => ({ from: first, to: addDays(addMonths(first, 1), -1), label: `${FULL_MONTH_NAMES[monthOf(first) - 1]} ${yearOf(first)}`, previous: 'last month', shift: from => addMonths(from, -1) });
  const year = number => ({ from: `${number}-01-01`, to: `${number}-12-31`, label: String(number), previous: 'last year', shift: from => `${yearOf(from) - 1}-01-01` });

  if (!words) return state.view === 'm' ? month(now.slice(0, 8) + '01') : week(mondayOf(now));
  if (words === 'week') return week(mondayOf(now));
  if (words === 'month') return month(now.slice(0, 8) + '01');
  if (words === 'year') return year(yearOf(now));
  let match = words.match(/^(?:week|wk|w)\s*(\d{1,2})(?:\s+(\d{4}))?$/);
  if (match) {
    const number = match[2] ? +match[2] : yearOf(today());
    const monday = addDays(mondayOf(`${number}-01-04`), (+match[1] - 1) * 7);
    if (isoWeek(monday) !== +match[1]) throw new Error(`${number} has no week ${match[1]}`);
    return week(monday);
  }
  if ((match = words.match(/^(\d{4})$/))) return year(+match[1]);
  if ((match = words.match(/^([a-z]{3,})(?:\s+(\d{4}))?$/))) {
    const monthIndex = FULL_MONTH_NAMES.findIndex(name => name.startsWith(match[1]));
    if (monthIndex >= 0) return month(`${match[2] || yearOf(today())}-${twoDigits(monthIndex + 1)}-01`);
  }
  throw new Error('stats takes week, month, year, week 48, dec, dec 2026 or 2026');
}

function minutesPerCategory(fromDate, toDate) {
  const totals = new Map();
  let travel = 0;
  for (const occurrence of occurrences(fromDate, toDate)) {
    if (occurrence.allDay) continue;
    const key = occurrence.plan.category_id || 'none';
    totals.set(key, (totals.get(key) || 0) + toMinutes(occurrence.end) - toMinutes(occurrence.start));
    travel += (+occurrence.plan.travel_minutes || 0) + (+occurrence.plan.return_minutes || 0);
  }
  return { totals, travel };
}

function durationText(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

COMMANDS.stats = {
  group: 'other', desc: 'hours per category, as a chart', ex: 'stats month',
  usage: 'stats [week | month | year | week 48 | dec | dec 2026 | 2026]',
  details: ['without a period: the week (or month) on screen.', 'counts repeating plans, skips, moves and travel. all day plans are not counted.'],
  run(args) {
    const period = statsPeriod(args);
    const { totals, travel } = minutesPerCategory(period.from, period.to);
    const previousFrom = period.shift(period.from);
    const previousTo = addDays(period.from, -1);
    const previous = minutesPerCategory(previousFrom, previousTo);
    const previousTotal = [...previous.totals.values()].reduce((sum, minutes) => sum + minutes, 0) + previous.travel;

    const rows = [...totals.entries()]
      .map(([key, minutes]) => {
        const category = key === 'none' ? null : categoryById(key);
        return { label: category ? `[${category.tag}] ${category.name}` : '(no category)', minutes };
      })
      .sort((first, second) => second.minutes - first.minutes);
    if (travel) rows.push({ label: 'travel', minutes: travel });
    if (!rows.length) return print(`nothing planned in ${period.label}`, 'dim');

    const total = rows.reduce((sum, row) => sum + row.minutes, 0);
    const longest = Math.max(...rows.map(row => row.minutes));
    const labelWidth = Math.max(...rows.map(row => row.label.length), 5) + 2;
    const barWidth = 24;
    const lines = [`stats · ${period.label}`, ''];
    for (const row of rows) {
      const bar = '█'.repeat(Math.max(1, Math.round(row.minutes / longest * barWidth)));
      lines.push(`${row.label.padEnd(labelWidth)}${bar.padEnd(barWidth + 1)} ${durationText(row.minutes)}`);
    }
    const difference = total - previousTotal;
    const compared = previousTotal ? `   (${period.previous}: ${durationText(previousTotal)}, ${difference >= 0 ? '+' : '-'}${durationText(Math.abs(difference))})` : '';
    lines.push('─'.repeat(labelWidth + barWidth + 8), `${'total'.padEnd(labelWidth + barWidth + 2)}${durationText(total)}${compared}`);
    print(lines.join('\n'), 'pre');
  },
};

COMMANDS.find = {
  group: 'other', desc: 'search plans, to dos and the bucket list', ex: 'find dentist', usage: 'find <text>',
  details: ['looks in titles, places, notes and category names. capitals do not matter.'],
  run(args) {
    const searchText = args.trim().replace(/^"|"$/g, '').toLowerCase();
    if (!searchText) throw new Error('what are you looking for? e.g. find dentist');
    const contains = (...fields) => fields.some(field => field && String(field).toLowerCase().includes(searchText));

    const plans = state.data.plans.filter(plan => {
      const category = categoryById(plan.category_id);
      return contains(plan.title, plan.location, plan.notes, category && category.name, category && category.tag);
    });
    const todos = state.data.todos.filter(todo => contains(todo.title, todo.notes));
    const bucketItems = state.data.bucket.filter(item => contains(item.title, item.notes));
    const total = plans.length + todos.length + bucketItems.length;
    if (!total) return print(`nothing found for "${searchText}"`, 'dim');

    const lines = [`${total} found for "${searchText}"`];
    if (plans.length) {
      lines.push('plans');
      for (const plan of plans) {
        lines.push(`  #${plan.id} ${tagText(categoryById(plan.category_id))}${plan.title}, ${describeWhen(plan)}${plan.location ? ' @' + plan.location : ''}`);
      }
    }
    if (todos.length) {
      lines.push('to do');
      for (const todo of todos) lines.push(`  #${todo.id} ${todo.title}, ${dueText(todo.deadline)}${todoRepeatText(todo)}`);
    }
    if (bucketItems.length) {
      lines.push('bucket list');
      for (const item of bucketItems) lines.push(`  ${item.id}. ${BUCKET_BOXES[item.status]} ${item.title}`);
    }
    print(lines.join('\n'), 'pre');
  },
};

COMMANDS.undo = {
  group: 'other', desc: 'take back your last change', ex: 'undo', usage: 'undo',
  details: [
    'works for add, edit, rm, skip, move, stop, cat and todo.',
    'bucket list changes are permanent and cannot be undone.',
    'only the last change of this session can be undone.',
  ],
  run() {
    const lastChange = state.undo;
    if (!lastChange) throw new Error('nothing to undo yet');
    if (lastChange.permanent) throw new Error(`your last change was "${lastChange.label}". the bucket list is permanent, so that can't be undone`);
    confirmThen(`undo "${lastChange.label}"? this ${lastChange.what}. (y/n)`, async () => {
      await lastChange.run();
      state.undo = null;
      printSuccess(`undone: ${lastChange.label}`);
    });
  },
};

COMMANDS.help = {
  group: 'other', desc: 'this list, or help <command>', ex: 'help add', usage: 'help [command]',
  run(args) {
    const asked = args.trim().toLowerCase();
    if (asked) return this.showOne(asked);

    const lines = [];
    let currentGroup = '';
    for (const [name, command] of Object.entries(COMMANDS)) {
      if (command.group !== currentGroup) {
        currentGroup = command.group;
        lines.push((lines.length ? '\n' : '') + currentGroup);
      }

      const rows = command.sub
        ? [[name, command.desc, name === 'bucket' || name === 'todo' ? command.ex : ''],
           ...Object.entries(command.sub).map(([subName, sub]) => [`${name} ${subName}`, sub.desc, sub.ex])]
        : [[name, command.desc, command.ex]];
      for (const [fullName, description, example] of rows) {
        if (fullName === 'cat') continue;
        const [first, second] = fullName.split(' ');
        const shortName = shortVersionOf(first) ? shortVersionOf(first) + (second ? ' ' + second : '') : '';
        lines.push(`  ${shortName.padEnd(8)}${fullName.padEnd(13)}${description.padEnd(42)}${example === fullName ? '' : example}`);
      }
    }
    lines.push('', 'the first column is the short version: t add Pay rent fri = todo add Pay rent fri.',
      'd, 3, w and m switch the view. help <command> shows details. Tab completes, ↑ ↓ repeat earlier commands.');
    print(lines.join('\n'), 'pre');
  },

  showOne(asked) {
    const name = COMMANDS[asked] ? asked : (SHORT_COMMANDS[asked] || '').split(' ')[0];
    const command = COMMANDS[name];
    if (!command) throw new Error(`no command "${asked}". type help to see all`);
    const shortName = shortVersionOf(name);
    print(command.usage, 'strong');
    print('  ' + command.desc + (shortName ? `  (short: ${shortName})` : ''));
    (command.details || []).forEach(line => print('  ' + line, 'dim'));
    if (command.sub) Object.values(command.sub).forEach(sub => print(`  e.g. ${sub.ex}`, 'dim'));
    else print(`  e.g. ${command.ex}`, 'dim');
  },
};

COMMANDS.theme = {
  group: 'other', desc: 'dark, light or auto (this device)', ex: 'theme dark', usage: 'theme dark | light | auto',
  details: ['auto follows your device setting. the choice is saved on this device only.'],
  run(args) {
    const theme = args.trim().toLowerCase();
    if (!['dark', 'light', 'auto'].includes(theme)) throw new Error('theme takes dark, light or auto');
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch {  }
    printSuccess(`theme: ${theme}`);
  },
};

COMMANDS.clear = {
  group: 'other', desc: 'clear this output', ex: 'clear', usage: 'clear',
  run() { ui.output.textContent = ''; },
};

COMMANDS.logout = {
  group: 'other', desc: 'log out', ex: 'logout', usage: 'logout',
  async run() {
    await callServer('logout');
    location.reload();
  },
};

const SHORT_COMMANDS = {
  a: 'add', s: 'show', e: 'edit', f: 'find', t: 'todo', b: 'bucket', c: 'cat', v: 'view', g: 'goto',
  n: 'next', p: 'prev', u: 'undo', h: 'help', '?': 'help', commands: 'help',
  d: 'view d', 3: 'view 3', w: 'view w', m: 'view m',
  remove: 'rm', delete: 'rm', del: 'rm',
};

const shortVersionOf = name => Object.keys(SHORT_COMMANDS).find(short => SHORT_COMMANDS[short] === name && short.length === 1);

function editDistance(first, second) {
  const table = Array.from({ length: first.length + 1 }, (_, row) => [row, ...Array(second.length).fill(0)]);
  for (let column = 1; column <= second.length; column++) table[0][column] = column;
  for (let row = 1; row <= first.length; row++) {
    for (let column = 1; column <= second.length; column++) {
      const sameLetter = first[row - 1] === second[column - 1];
      table[row][column] = Math.min(
        table[row - 1][column] + 1,
        table[row][column - 1] + 1,
        table[row - 1][column - 1] + (sameLetter ? 0 : 1),
      );
    }
  }
  return table[first.length][second.length];
}

async function runLine(line) {
  line = line.trim();
  if (!line) return;

  const showMatch = line.match(/^show\s+#?(\d+)$/i);
  const lastOutput = ui.output.lastElementChild;
  if (showMatch && lastOutput && lastOutput.dataset.show === showMatch[1]) {
    lastOutput.classList.remove('flash');
    void lastOutput.offsetWidth;
    lastOutput.classList.add('flash');
    return;
  }

  print(promptText() + ' ' + line, 'echo');
  state.history.push(line);
  state.historyIndex = state.history.length;

  let name = line.split(/\s+/)[0].toLowerCase();
  let args = line.slice(name.length).trim();
  if (!COMMANDS[name] && SHORT_COMMANDS[name]) {
    const [realName, ...extraArgs] = SHORT_COMMANDS[name].split(' ');
    name = realName;
    args = [...extraArgs, args].filter(Boolean).join(' ');
  }

  const command = COMMANDS[name];
  if (!command) {
    const guess = Object.keys(COMMANDS).find(known => editDistance(known, name) <= 2);
    return printError(`unknown command "${name}".${guess ? ` did you mean ${guess}?` : ''} type help to see all commands`);
  }
  try {
    await command.run(args);
  } catch (error) {
    printError(error.message);
  }
}

const ALL_COMMAND_NAMES = ['add', 'show', 'edit', 'copy', 'tick', 'rm', 'skip', 'move', 'stop', 'view', 'today', 'next', 'prev', 'goto', 'find', 'stats', 'undo', 'cat', 'todo', 'bucket', 'theme', 'help', 'clear', 'logout'];
const RUN_NOW = '✓ done';

const chip = (label, insert = label, extra = {}) => ({ label, insert, ...extra });
const runNowChip = () => chip(RUN_NOW, '', { run: true });
const dateChips = () => [chip('today'), chip('tomorrow'), ...DAY_NAMES.map(name => chip(name))];
const timeChips = () => frequentTimes().map(time => chip(time));
const categoryChips = () => state.data.categories.map(category => chip(`[${category.tag}] ${category.name}`, `[${category.tag}]`));
const dateChip = date => chip(`${DAY_NAMES[weekdayIndex(date)]} ${shortDate(date)}`, typedDate(date));

function planChips(repeatingOnly) {
  let plans = state.data.plans;
  if (!isListView()) {
    const [firstDate, lastDate] = visibleRange();
    const onScreen = new Map(occurrences(firstDate, lastDate).map(occurrence => [occurrence.plan.id, occurrence.plan]));
    plans = [...onScreen.values()];
  }
  return plans
    .filter(plan => !repeatingOnly || plan.repeat_type !== 'none')
    .map(plan => chip(`#${plan.id} ${plan.title}`, String(plan.id)));
}

function suggestionsFor(typedText) {
  if (state.mode !== 'command') return [];
  if (state.pendingConfirm) return [chip('y', 'y', { run: true }), chip('n', 'n', { run: true })];

  const words = typedText.split(/\s+/);
  if (words.length === 1) return ALL_COMMAND_NAMES.map(name => chip(name));

  let commandName = words[0].toLowerCase();
  if (!COMMANDS[commandName] && SHORT_COMMANDS[commandName] && !SHORT_COMMANDS[commandName].includes(' ')) {
    commandName = SHORT_COMMANDS[commandName];
  }

  const withoutLastWord = typedText.endsWith(' ') ? typedText : typedText.split(/\s+/).slice(0, -1).join(' ');
  const finished = withoutLastWord.split(/\s+/).slice(1).filter(Boolean);
  const allWords = typedText.split(/\s+/).slice(1).filter(Boolean);

  switch (commandName) {
    case 'add':
    case 'edit': return planShorthandChips(commandName, finished, allWords);
    case 'show':
    case 'rm': return finished.length ? [] : planChips(false);
    case 'copy': return copyChips(finished);
    case 'tick': return tickChips(finished);
    case 'stats': return finished.length ? [] : ['week', 'month', 'year', FULL_MONTH_NAMES[monthOf(today()) - 1]].map(name => chip(name, name, { run: true }));
    case 'skip':
    case 'move':
    case 'stop': return seriesChips(commandName, finished);
    case 'undo':
      if (finished.length || !state.undo || state.undo.permanent) return [];
      return [chip(`undo ${state.undo.label}`, '', { run: true })];
    case 'view':
      if (finished.length) return [];
      return [['d', 'day'], ['3', '3 days'], ['w', 'week'], ['m', 'month']].map(([view, name]) => chip(`${view} ${name}`, view, { run: true }));
    case 'goto': {
      if (finished.length) return [];
      const nextWeek = isoWeek(addDays(today(), 7));
      const nextMonth = FULL_MONTH_NAMES[monthOf(addMonths(today(), 1)) - 1];
      const [todayChip, tomorrowChip, ...weekdayChips] = dateChips();
      return [todayChip, tomorrowChip, chip(`week ${nextWeek}`, `week ${nextWeek}`, { run: true }), chip(nextMonth, nextMonth, { run: true }), ...weekdayChips];
    }
    case 'theme': return finished.length ? [] : ['dark', 'light', 'auto'].map(theme => chip(theme, theme, { run: true }));
    case 'cat': return categoryCommandChips(finished);
    case 'todo': return todoCommandChips(finished, allWords);
    case 'bucket': return bucketCommandChips(finished);
    case 'help': return finished.length ? [] : Object.keys(COMMANDS).map(name => chip(name, name, { run: true }));
    default: return [];
  }
}

function copyChips(finished) {
  if (!finished.length) return planChips(false);
  if (finished.length === 1) return dateChips();
  if (finished.length === 2) return [runNowChip(), ...timeChips()];
  return [];
}

function tickChips(finished) {
  const withChecklist = planChips(false).filter(option => noteLines(planById(option.insert).notes).some(isChecklistNote));
  if (!finished.length) return withChecklist;
  const plan = planById(finished[0]);
  if (!plan || finished.length > 1) return [];
  return noteLines(plan.notes)
    .map((note, index) => ({ note, number: index + 1 }))
    .filter(({ note }) => isChecklistNote(note))
    .map(({ note, number }) => chip(`${number} ${note}`, String(number), { run: true }));
}

function planShorthandChips(commandName, finished, allWords) {
  if (commandName === 'edit' && !finished.length) return planChips(false).map(option => ({ ...option, run: true }));
  const parts = parseParts(allWords.slice(commandName === 'edit' ? 1 : 0).join(' '));
  if (commandName === 'add' && !parts.title) return [chip('type a title…', '', { hint: true })];

  const chips = [];
  if (!parts.dates.length) chips.push(...dateChips());
  if (!parts.times.length && !parts.allDay) chips.push(...timeChips(), chip('all day'));
  if (parts.tag === null) chips.push(...categoryChips());
  if (commandName === 'add' && parts.every === null) {
    const weekday = DAY_NAMES[weekdayIndex(parts.dates[0] || today())];
    chips.push(chip(`every ${weekday}`), chip('every month'), chip('every year'));
  }
  if (parts.location === null && parts.notes === null) chips.push(chip('@place', '@', { glue: true }));
  if (parts.travel === null && (parts.location !== null || commandName === 'edit')) {
    chips.push(...[15, 30, 45].map(minutes => chip(`travel ${minutes}`)));
  }
  if (parts.travel !== null && parts.returnTravel === null) {
    chips.push(...[parts.travel, 15, 30].filter((minutes, index, all) => minutes && all.indexOf(minutes) === index).map(minutes => chip(`return ${minutes}`)));
  }
  if (parts.notes === null) chips.push(chip('-- note', '--'));

  const readyToRun = commandName === 'add' ? parts.title && (parts.times.length || parts.allDay) : allWords.length > 1;
  if (readyToRun) chips.unshift(runNowChip());
  return chips;
}

function seriesChips(commandName, finished) {
  if (!finished.length) return planChips(true);
  const plan = planById(finished[0]);
  if (!plan) return [];
  if (commandName === 'stop') return finished.length === 1 ? [chip('today'), runNowChip()] : [];
  if (finished.length === 1) return upcomingDates(plan).map(dateChip);
  if (commandName === 'move' && finished.length === 2) {
    const fromDate = parseDate(finished[1]);
    return fromDate ? [-1, 1, 2].map(days => dateChip(addDays(fromDate, days))) : [];
  }
  if (commandName === 'move' && finished.length === 3) return [runNowChip(), ...timeChips()];
  return [];
}

function categoryCommandChips(finished) {
  if (!finished.length) return ['add', 'ls', 'edit', 'rm'].map(name => chip(name));
  if (finished[0] === 'edit' && finished.length === 1) {
    return state.data.categories.map(category => chip(`[${category.tag}] ${category.name}`, category.tag, { run: true }));
  }
  if (finished[0] === 'rm' && finished.length === 1) {
    return state.data.categories.map(category => chip(`[${category.tag}] ${category.name}`, category.tag, { run: true }));
  }
  if (finished[0] === 'add' && finished.length >= 3) return BORDER_STYLES.map(border => chip(border));
  return [];
}

function todoCommandChips(finished, allWords) {
  const todoPicks = state.data.todos.map(todo => chip(`#${todo.id} ${todo.title}`, String(todo.id)));
  const [subCommand] = finished;
  if (!subCommand) return ['add', 'edit', 'done', 'tick', 'plan'].map(name => chip(name));
  if ((subCommand === 'done' || subCommand === 'edit') && finished.length === 1) return todoPicks.map(pick => ({ ...pick, run: true }));
  if (subCommand === 'plan' && finished.length === 1) return todoPicks;
  if (subCommand === 'tick') {
    if (finished.length === 1) return todoPicks.filter(pick => noteLines(todoById(pick.insert).notes).some(isChecklistNote));
    const todo = state.data.todos.find(item => item.id == finished[1]);
    if (!todo || finished.length > 2) return [];
    return noteLines(todo.notes)
      .map((note, index) => ({ note, number: index + 1 }))
      .filter(({ note }) => isChecklistNote(note))
      .map(({ note, number }) => chip(`${number} ${note}`, String(number), { run: true }));
  }

  if (subCommand === 'plan') {
    const parts = parseParts(allWords.slice(2).join(' '));
    const chips = [];
    if (!parts.dates.length) chips.push(...dateChips());
    if (!parts.times.length) chips.push(...timeChips());
    if (parts.tag === null) chips.push(...categoryChips());
    if (parts.times.length) chips.unshift(runNowChip());
    return chips;
  }

  if (subCommand === 'add' || (subCommand === 'edit' && finished.length > 1)) {
    const parts = parseParts(allWords.slice(subCommand === 'edit' ? 2 : 1).join(' '));
    if (subCommand === 'add' && !parts.title) return [chip('type a title…', '', { hint: true })];
    const typedNoDeadline = /(^|\s)no\s+deadline(\s|$)/i.test(allWords.join(' '));
    const chips = [];
    if (!parts.dates.length && !typedNoDeadline) chips.push(chip('no deadline'), ...dateChips());
    if (parts.every === null && !typedNoDeadline) chips.push(chip('every month'), chip('every week'), chip('every year'));
    if (parts.notes === null) chips.push(chip('-- note', '--'));
    const readyToRun = subCommand === 'add' ? parts.dates.length || typedNoDeadline : true;
    if (readyToRun) chips.unshift(runNowChip());
    return chips;
  }
  return [];
}

function bucketCommandChips(finished) {
  const [subCommand] = finished;
  if (!subCommand) return ['add', 'done', 'fail'].map(name => chip(name));
  if ((subCommand === 'done' || subCommand === 'fail') && finished.length === 1) {
    return state.data.bucket
      .filter(item => item.status === 'open')
      .map(item => chip(`#${item.id} ${item.title}`, String(item.id), { run: true }));
  }
  if (subCommand === 'add' && finished.length > 1) return [chip('-- note', '--'), runNowChip()];
  return [];
}

function matchChips(typedText) {
  const all = suggestionsFor(typedText);
  const partialWord = typedText.endsWith(' ') || !typedText ? '' : typedText.split(/\s+/).pop();
  const completions = partialWord
    ? all.filter(option => option.insert && option.insert.toLowerCase().startsWith(partialWord.toLowerCase()) && option.insert !== partialWord)
    : [];
  return completions.length
    ? { chips: completions, replacesWord: true, partialWord }
    : { chips: all, replacesWord: false, partialWord };
}

function applyChip(picked, match) {
  if (picked.hint) return ui.input.focus();
  let text = ui.input.value;
  if (picked.insert) {
    if (match.replacesWord) text = text.slice(0, text.length - match.partialWord.length) + picked.insert;
    else text = (text && !text.endsWith(' ') ? text + ' ' : text) + picked.insert;
    if (!picked.glue && !picked.run) text += ' ';
  }
  ui.input.value = text;
  if (picked.run) submitInput();
  else {
    refreshPrompt();
    ui.input.focus();
  }
}

function refreshPrompt() {
  const typedText = ui.input.value;
  ui.promptLabel.textContent =
    state.mode === 'username' ? 'login:' :
    state.mode === 'password' ? 'password:' :
    state.pendingConfirm ? '(y/n)' : promptText();
  ui.input.type = state.mode === 'password' ? 'password' : 'text';

  const match = matchChips(typedText);
  if (!typedText && !state.pendingConfirm && !IS_TOUCH_SCREEN) match.chips = [];
  ui.chips.textContent = '';
  for (const option of match.chips) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option.label;
    button.className = option.run && !option.insert ? 'chip go' : option.hint ? 'chip hint' : 'chip';
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => applyChip(option, match));
    ui.chips.appendChild(button);
  }

  let ghostText = '';
  if (match.replacesWord) {
    ghostText = match.chips[0].insert.slice(match.partialWord.length);
  } else {
    const command = COMMANDS[typedText.trim().toLowerCase()];
    const justTheCommand = typedText.endsWith(' ') && typedText.trim().split(/\s+/).length === 1;
    if (command && justTheCommand) ghostText = command.usage.slice(typedText.trim().length + 1);
  }
  ui.ghost.innerHTML = ghostText && typedText.length < 60
    ? `<span class="typed">${escapeHtml(typedText)}</span>${escapeHtml(ghostText)}`
    : '';
}

async function submitInput() {
  const typedText = ui.input.value;
  ui.input.value = '';
  state.activeFullEdit = state.fullEdit;
  state.fullEdit = null;
  markAnswerStart();
  try {
    await handleInput(typedText);
  } finally {
    state.activeFullEdit = null;
    scrollToAnswer();
    refreshPrompt();
  }
}

async function handleInput(typedText) {
  if (state.mode === 'username') {
    if (!typedText.trim()) return refreshPrompt();
    print('login: ' + typedText, 'echo');
    state.loginUsername = typedText.trim();
    state.mode = 'password';
    return refreshPrompt();
  }

  if (state.mode === 'password') {
    print('password:', 'echo');
    state.mode = 'username';
    refreshPrompt();
    try {
      await callServer('login', { username: state.loginUsername, password: typedText });
      location.reload();
    } catch (error) {
      printError(error.message);
    }
    return;
  }

  if (state.pendingConfirm) {
    const answer = typedText.trim().toLowerCase();
    const onYes = state.pendingConfirm;
    state.pendingConfirm = null;
    if (answer === 'y' || answer === 'yes') {
      print(promptText() + ' y', 'echo');
      try { await onYes(); } catch (error) { printError(error.message); }
      return refreshPrompt();
    }
    print('cancelled', 'dim');
    if (!['', 'n', 'no'].includes(answer)) await runLine(typedText);
    return;
  }

  await runLine(typedText);
}

ui.input.addEventListener('input', refreshPrompt);

ui.input.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitInput();
  }
  else if (event.key === 'Tab') {
    event.preventDefault();
    const match = matchChips(ui.input.value);
    const first = match.chips.find(option => option.insert && !option.run) || (match.replacesWord && match.chips[0]);
    if (first) applyChip({ ...first, run: false }, match);
  }
  else if (event.key === 'ArrowUp' && state.mode === 'command' && state.history.length) {
    event.preventDefault();
    state.historyIndex = Math.max(0, state.historyIndex - 1);
    ui.input.value = state.history[state.historyIndex];
    refreshPrompt();
  }
  else if (event.key === 'ArrowDown' && state.mode === 'command') {
    event.preventDefault();
    state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
    ui.input.value = state.history[state.historyIndex] || '';
    refreshPrompt();
  }
  else if (event.key === 'Escape') {
    state.fullEdit = null;
    if (state.pendingConfirm) {
      state.pendingConfirm = null;
      print('cancelled', 'dim');
    }
    ui.input.value = '';
    refreshPrompt();
  }
});

function escapeHtml(text) {
  const replacements = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, character => replacements[character]);
}

const lineOf = character => character.repeat(240);

function characterWidth() {
  const probe = document.createElement('span');
  probe.textContent = 'x'.repeat(20);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  ui.view.appendChild(probe);
  const width = probe.getBoundingClientRect().width / 20;
  probe.remove();
  return width || 8;
}

function visibleRange() {
  const cursor = state.cursor;
  switch (state.view) {
    case 'd': return [cursor, cursor];
    case '3': return [cursor, addDays(cursor, 2)];
    case 'm': {
      const firstMonday = mondayOf(cursor.slice(0, 8) + '01');
      return [firstMonday, addDays(firstMonday, 41)];
    }
    default: {
      const monday = mondayOf(cursor);
      return [monday, addDays(monday, 6)];
    }
  }
}

function rangeLabel() {
  if (state.view === 'bucket') return 'bucket list';
  if (state.view === 'todo') return 'to do';
  if (state.view === 'm') return `${FULL_MONTH_NAMES[monthOf(state.cursor) - 1]} ${yearOf(state.cursor)}`;

  const [firstDate, lastDate] = visibleRange();
  const week = `week ${isoWeek(firstDate)}`;
  if (state.view === 'd') return `${week} · ${fullDate(firstDate)}`;

  const sameMonth = firstDate.slice(0, 7) === lastDate.slice(0, 7);
  const sameYear = yearOf(firstDate) === yearOf(lastDate);
  const span = sameMonth
    ? `${dayOfMonth(firstDate)}–${shortDate(lastDate)} ${yearOf(lastDate)}`
    : `${shortDate(firstDate)}${sameYear ? '' : ' ' + yearOf(firstDate)} – ${shortDate(lastDate)} ${yearOf(lastDate)}`;
  return `${week} · ${span}`;
}

function renderStatus() {
  const viewName = { d: 'day', 3: '3 days', w: 'week', m: 'month', bucket: 'bucket', todo: 'to do' }[state.view];
  ui.status.innerHTML = APP.loggedIn
    ? `<span>index</span><span>${escapeHtml(rangeLabel())}</span><span class="wide">view: ${viewName}</span><span class="clock">${currentTime()}</span>`
    : `<span>index</span><span>not logged in</span><span class="clock">${currentTime()}</span>`;
}

function wrapText(text, width) {
  width = Math.max(1, Math.floor(width));
  const lines = [];
  let line = '';
  for (let word of String(text).split(/\s+/).filter(Boolean)) {
    while (word.length > width) {
      if (line) { lines.push(line); line = ''; }
      lines.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ' ' + word;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

function wrapTitle(title, width, maxLines) {
  const lines = wrapText(title, width);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = kept[maxLines - 1].slice(0, Math.max(1, Math.floor(width) - 1)) + '…';
  return kept;
}

function flowText(parts, widthAt, rowCount, fullWidth = Infinity) {
  const rows = [];
  for (const [partNumber, [text, style, extra]] of parts.entries()) {
    const words = String(text).split(/[ \t\n]+/).filter(Boolean);
    while (words.length) {
      while (rows.length < rowCount && widthAt(rows.length) < 4) rows.push(null);
      if (rows.length >= rowCount) {
        const lastRow = rows.filter(Boolean).pop();
        if (lastRow && lastRow.part === partNumber) lastRow.text = lastRow.text.slice(0, Math.max(1, lastRow.width - 1)) + '…';
        return rows;
      }
      const width = widthAt(rows.length);
      let line = '';
      while (words.length) {
        const word = words[0];
        if (word.length > width && word.includes('\u00a0')) {
          words.splice(0, 1, ...word.split('\u00a0'));
          continue;
        }
        if (!line && word.length > width && word.length <= fullWidth && width < fullWidth && rows.length < rowCount - 1) {
          line = null;
          break;
        }
        if (!line && word.length > width) {
          line = word.slice(0, width);
          words[0] = word.slice(width);
          break;
        }
        if ((line ? line.length + 1 : 0) + word.length > width) break;
        line = line ? `${line} ${word}` : word;
        words.shift();
      }
      rows.push(line === null ? null : { text: line, style, width, part: partNumber, extra });
    }
  }
  return rows;
}

const MINUTES_PER_LINE = 5;
const glue = text => text.replace(/ /g, '\u00a0');
const leaveText = (start, travel) => `${glue(`→ leave ${leaveAt(start, travel)}`)} · ${glue(`${travelText(travel)} travel`)}`;
const homeText = (end, back) => `${glue(`← home ${returnHomeAt(end, back)}`)} · ${glue(`${travelText(back)} back`)}`;

function noteParts(plan, kind) {
  return noteLines(plan.notes).map((note, index) => {
    const checkbox = note.match(/^\[([ x])\] (.*)$/);
    const text = checkbox ? `[${checkbox[1] === 'x' ? 'x' : '\u00a0'}] ${checkbox[2]}` : note;
    return [text, checkbox ? (checkbox[1] === 'x' ? 'ticked' : 'tick') : 'note', { kind, id: plan.id, number: index + 1 }];
  });
}

function renderFlowedLine(line, previousPart) {
  if (!line) return '';
  if (line.style === 'b') return `<b>${escapeHtml(line.text)}</b>`;
  if (line.style === 'tick' || line.style === 'ticked') {
    const firstLine = line.part !== previousPart;
    const done = line.style === 'ticked' ? ' ticked' : '';
    if (firstLine && /^\[.\]/.test(line.text)) {
      const { kind, id, number } = line.extra;
      return `<span class="note${done}"><span class="tick" data-tick-kind="${kind}" data-tick-id="${id}" data-tick-note="${number}">${escapeHtml(line.text.slice(0, 3))}</span>${escapeHtml(line.text.slice(3))}</span>`;
    }
    return `<span class="note${done}">${escapeHtml(line.text)}</span>`;
  }
  if (line.style === 'note') return `<span class="note">${escapeHtml(line.text)}</span>`;
  return `<span class="dim">${escapeHtml(line.text)}</span>`;
}

function planBox(occurrence, style, widthInChars, coveredBy = []) {
  const { plan, start, end } = occurrence;
  const category = categoryById(plan.category_id);
  const [topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical] = BOX_CHARACTERS[category ? category.border : 'solid'];
  const label = `#${plan.id}${category ? ` [${category.tag}]` : ''}`;
  const time = `${start}–${end}${occurrence.movedFrom ? ' (moved)' : ''}`;
  const travel = +plan.travel_minutes || 0;
  const back = +plan.return_minutes || 0;
  const lineCount = Math.max(1, Math.floor((toMinutes(end) - toMinutes(start)) / MINUTES_PER_LINE));
  const open = (extraClass = '') => `<div class="ev${extraClass}" style="${style}" data-id="${plan.id}" title="${escapeHtml(plan.title)}, ${time}">`;
  const row = (content, withRightSide) =>
    `<div class="row"><span class="side">${vertical}</span><span class="txt">${content}</span>${withRightSide ? `<span class="side">${vertical}</span>` : ''}</div>`;
  const bold = text => `<b>${escapeHtml(text)}</b>`;
  const dim = text => `<span class="dim">${escapeHtml(text)}</span>`;

  if (widthInChars < 12) {
    if (lineCount === 1) return open(' slim') + row(bold(plan.title)) + '</div>';
    const rows = [
      `<span class="lbl">${escapeHtml(widthInChars < 7 ? '#' + plan.id : label)}</span>`,
      ...wrapTitle(plan.title, widthInChars - 2, Math.max(1, lineCount - 2)).map(bold),
      dim(start),
    ];
    if (travel) rows.push(dim('→' + leaveAt(start, travel)));
    if (back) rows.push(dim('←' + returnHomeAt(end, back)));
    while (rows.length < lineCount) rows.push('');
    return open(' slim') + rows.slice(0, lineCount).map(content => row(content)).join('') + '</div>';
  }

  if (lineCount < 3) {
    const rows = [`<span class="lbl">${escapeHtml(label)}</span> ${bold(plan.title)}`, dim(time)].slice(0, lineCount);
    return open() + rows.map(content => row(content)).join('') + '</div>';
  }

  const innerRows = lineCount - 2;
  const innerWidth = Math.max(4, Math.floor(widthInChars) - 4);
  const startMinutes = toMinutes(start);
  const widthAt = rowNumber => {
    const rowFrom = startMinutes + MINUTES_PER_LINE * (rowNumber + 1);
    const rowTo = rowFrom + MINUTES_PER_LINE;
    return coveredBy
      .filter(cover => cover.from < rowTo && cover.to > rowFrom)
      .reduce((narrowest, cover) => Math.min(narrowest, cover.width), innerWidth);
  };
  const parts = [
    [plan.title, 'b'],
    [time, 'dim'],
    travel ? [leaveText(start, travel), 'dim'] : null,
    back ? [homeText(end, back), 'dim'] : null,
    plan.location ? [`@${plan.location}`, 'dim'] : null,
    ...noteParts(plan, 'plan'),
  ].filter(Boolean);
  const lines = flowText(parts, widthAt, innerRows, innerWidth);
  const rows = lines.map((line, index) => {
    const previous = lines.slice(0, index).filter(Boolean).pop();
    return renderFlowedLine(line, previous ? previous.part : -1);
  });

  return open() +
    `<div class="row edge"><span>${topLeft}${horizontal} </span><span class="lbl">${escapeHtml(label)}</span><span class="fill"> ${lineOf(horizontal)}</span><span>${topRight}</span></div>` +
    rows.map(content => row(content, true)).join('') +
    Array(innerRows - rows.length).fill(row('', true)).join('') +
    `<div class="row edge"><span>${bottomLeft}</span><span class="fill">${lineOf(horizontal)}</span><span>${bottomRight}</span></div></div>`;
}

function travelTrail(occurrence, style, widthInChars, minutes, text, extraClass) {
  const lineCount = Math.max(1, Math.floor(minutes / MINUTES_PER_LINE));
  const width = Math.max(4, Math.floor(widthInChars) - 3);
  const lines = flowText([[text, 'dim']], () => width, lineCount).filter(Boolean).map(line => line.text);
  const rows = Array.from({ length: lineCount }, (_, index) => lines[index] || '')
    .map(content => `<div class="row"><span class="side">┊</span><span class="txt"><span class="dim">${escapeHtml(content)}</span></span></div>`);
  const place = occurrence.plan.location || occurrence.plan.title;
  return `<div class="ev travel${extraClass}" style="${style}" data-id="${occurrence.plan.id}" title="${escapeHtml(place)}">${rows.join('')}</div>`;
}

function allDayLines(date, dayOccurrences) {
  return dayOccurrences.filter(occurrence => occurrence.allDay).map(({ plan, dayNumber, dayCount }) => {
    const days = dayCount > 1 ? ` <span class="dim">${dayNumber}/${dayCount}</span>` : '';
    const mark = dayCount > 1 && dayNumber > 1 ? '▸' : '■';
    return `<div class="allday-line" data-id="${plan.id}" title="${escapeHtml(plan.title)}, ${escapeHtml(describeWhen(plan))}">${mark} ${escapeHtml(plan.title)}${days}</div>`;
  }).join('');
}

function todoLines(date, maxShown = 3) {
  const now = today();
  const due = state.data.todos.filter(todo => todo.deadline && (todo.deadline === date || (date === now && todo.deadline < now)));
  const lines = due.slice(0, maxShown).map(todo => {
    const late = todo.deadline < now;
    return `<div class="todo-line${late ? ' late' : ''}" data-todo="${todo.id}" title="${escapeHtml(todo.title)}, due ${fullDate(todo.deadline)}">${late ? '!' : '☐'} ${escapeHtml(todo.title)}</div>`;
  });
  if (due.length > maxShown) lines.push(`<div class="todo-line more" data-todo="">+${due.length - maxShown} more to do</div>`);
  return lines.join('');
}

function stackPlans(dayPlans, columnChars) {
  dayPlans.sort((first, second) =>
    first.fromMinutes - second.fromMinutes ||
    (second.untilMinutes - second.fromMinutes) - (first.untilMinutes - first.fromMinutes));

  const normalShift = Math.min(3, columnChars * 0.18);
  const placed = [];
  for (const current of dayPlans) {
    const below = placed.filter(other => other.untilMinutes > current.fromMinutes).pop();
    current.level = below ? below.level + 1 : 0;
    current.leftChars = 0;
    current.coveredBy = [];

    if (below) {
      const titleWidth = Math.min(below.plan.title.length, Math.floor(columnChars - below.leftChars) - 4);
      const landsOnTitle = current.fromMinutes < below.startMinutes + 30;
      const shift = landsOnTitle ? Math.min(Math.max(titleWidth + 5, 20), (columnChars - below.leftChars) / 2) : normalShift;
      current.leftChars = Math.min(below.leftChars + shift, columnChars * 0.6);
    }
    for (const other of placed) {
      if (other.untilMinutes > current.fromMinutes && other.level < current.level) {
        other.coveredBy.push({ from: current.fromMinutes, to: current.untilMinutes, width: Math.floor(current.leftChars - other.leftChars) - 3 });
      }
    }
    placed.push(current);
  }
  return dayPlans;
}

const percentOfDay = minutes => minutes / (MINUTES_PER_DAY / 100);

function renderGrid() {
  const [firstDate, lastDate] = visibleRange();
  const days = [];
  for (let date = firstDate; date <= lastDate; date = addDays(date, 1)) days.push(date);
  const allOccurrences = occurrences(firstDate, lastDate);
  const now = today();
  const nowMinutes = toMinutes(currentTime());
  const charWidth = characterWidth();
  const columnChars = (ui.view.clientWidth - 8 * charWidth) / days.length / charWidth;

  let html = `<div class="grid cols-${days.length}" style="--cols:${days.length}"><div class="dh corner"></div>`;
  for (const date of days) {
    const monthName = days.length === 1 ? ' ' + MONTH_NAMES[monthOf(date) - 1] : '';
    html += `<div class="dh${date === now ? ' today' : ''}"><div class="dh-line"><span class="pre">── </span>` +
      `<span class="lbl">${DAY_NAMES[weekdayIndex(date)]} ${dayOfMonth(date)}${monthName}</span><span class="fill"> ${lineOf('─')}</span></div>` +
      `${allDayLines(date, allOccurrences.filter(occurrence => occurrence.date === date))}${todoLines(date)}</div>`;
  }

  const quarterMarks = ['15', '30', '45'].map(minute => `<span class="quarter">:${minute} ┤</span>`).join('');
  const nowInGutter = days.includes(now) ? `<span class="now-time" style="top:${percentOfDay(nowMinutes)}%"><b>${currentTime()}</b></span>` : '';
  html += `<div class="hours">${Array.from({ length: 24 }, (_, hour) => `<div><span class="hour">${twoDigits(hour)}:00 ┤</span>${quarterMarks}</div>`).join('')}${nowInGutter}</div>`;

  for (const date of days) {
    const dayPlans = allOccurrences.filter(occurrence => occurrence.date === date && !occurrence.allDay).map(occurrence => {
      const startMinutes = toMinutes(occurrence.start);
      const endMinutes = toMinutes(occurrence.end);
      const travel = +occurrence.plan.travel_minutes || 0;
      const back = +occurrence.plan.return_minutes || 0;
      return {
        ...occurrence, travel, back, startMinutes, endMinutes,
        fromMinutes: Math.max(0, startMinutes - travel),
        untilMinutes: Math.min(MINUTES_PER_DAY, endMinutes + back),
      };
    });
    stackPlans(dayPlans, columnChars);

    html += `<div class="col" data-date="${date}">`;
    for (const item of dayPlans) {
      const left = item.leftChars.toFixed(1);
      const horizontal = `left:${left}ch;width:calc(100% - ${left}ch);z-index:${1 + item.level}`;
      const paper = item.level ? ';background:var(--white)' : '';
      const widthInChars = columnChars - item.leftChars;
      if (item.travel && item.startMinutes > item.fromMinutes) {
        html += travelTrail(item, `top:${percentOfDay(item.fromMinutes)}%;height:${percentOfDay(item.startMinutes - item.fromMinutes)}%;${horizontal}${paper}`,
          widthInChars, item.startMinutes - item.fromMinutes, leaveText(item.start, item.travel), '');
      }
      if (item.back && item.untilMinutes > item.endMinutes) {
        html += travelTrail(item, `top:${percentOfDay(item.endMinutes)}%;height:${percentOfDay(item.untilMinutes - item.endMinutes)}%;${horizontal}${paper}`,
          widthInChars, item.untilMinutes - item.endMinutes, homeText(item.end, item.back), ' back');
      }
      html += planBox(item, `top:${percentOfDay(item.startMinutes)}%;height:${percentOfDay(item.endMinutes - item.startMinutes)}%;${horizontal}`,
        columnChars - item.leftChars, item.coveredBy);
    }
    if (days.includes(now)) {
      html += `<div class="now${date === now ? '' : ' elsewhere'}" style="top:${percentOfDay(nowMinutes)}%"></div>`;
    }
    html += '</div>';
  }
  ui.view.innerHTML = html + '</div>';

  const rangeKey = state.view + firstDate;
  if (state.scrolledFor !== rangeKey) {
    state.scrolledFor = rangeKey;
    const hourHeight = ui.view.querySelector('.col').offsetHeight / 24;
    const startHour = days.includes(now) ? Math.max(0, Math.floor(nowMinutes / 60) - 2) : 7;
    ui.view.scrollTop = Math.max(0, (startHour - 0.3) * hourHeight);
  }
}

function renderMonth() {
  const [firstDate] = visibleRange();
  const allOccurrences = occurrences(firstDate, addDays(firstDate, 41));
  const shownMonth = state.cursor.slice(0, 7);
  const now = today();

  let html = '<div class="month">' + DAY_NAMES.map(name => `<div class="mh">${name}</div>`).join('');
  for (let dayNumber = 0; dayNumber < 42; dayNumber++) {
    const date = addDays(firstDate, dayNumber);
    const dayPlans = allOccurrences.filter(occurrence => occurrence.date === date);
    const classes = `cell${date.slice(0, 7) !== shownMonth ? ' other' : ''}${date === now ? ' today' : ''}`;
    html += `<div class="${classes}" data-date="${date}"><span class="num">${dayOfMonth(date)}</span>${todoLines(date, 2)}`;
    html += dayPlans.slice(0, 4).map(({ plan, start, allDay, dayNumber, dayCount }) => {
      const category = categoryById(plan.category_id);
      if (allDay) {
        const mark = dayCount > 1 && dayNumber > 1 ? '▸' : '■';
        return `<div class="m-item allday"><span class="side">${mark}</span><span class="title">${escapeHtml(plan.title)}</span></div>`;
      }
      const side = BOX_CHARACTERS[category ? category.border : 'solid'][5];
      const tag = category ? `[${escapeHtml(category.tag)}]` : `#${plan.id}`;
      return `<div class="m-item"><span class="side">${side}</span><span class="time">${start} </span><span class="tag">${tag}</span><span class="title"> ${escapeHtml(plan.title)}</span></div>`;
    }).join('');
    if (dayPlans.length > 4) html += `<div class="more">+${dayPlans.length - 4} more</div>`;
    html += '</div>';
  }
  ui.view.innerHTML = html + '</div>';
}

function renderBucket() {
  const items = state.data.bucket;
  const countWithStatus = status => items.filter(item => item.status === status).length;
  let html = `<div class="bucket"><pre class="bucket-head">bucket list
${'═'.repeat(11)}
${items.length} items, ${countWithStatus('open')} open, ${countWithStatus('completed')} completed, ${countWithStatus('failed')} failed</pre>`;

  if (!items.length) html += `<pre class="empty">
     \\         /
      \\_______/
       |     |      nothing in here yet.
       |     |      add your first item:
       |_____|      bucket add Learn to sail
</pre>`;

  html += '<ol>' + items.map(item => {
    const stamp = item.status === 'open' ? ''
      : `<span class="stamp ${item.status}">${item.status}<small>${escapeHtml(shortDate(item.resolved))} ${yearOf(item.resolved)}</small></span>`;
    const notes = item.notes ? `<div class="notes">${escapeHtml(item.notes)}</div>` : '';
    return `<li class="${item.status}"><div class="item">` +
      `<div><span class="n">${String(item.id).padStart(3)}.</span> <span class="box">${BUCKET_BOXES[item.status]}</span> <span class="title">${escapeHtml(item.title)}</span></div>` +
      `<div class="meta">${notes}<div class="added">added ${escapeHtml(shortDate(item.created))} ${yearOf(item.created)}</div></div></div>` +
      `<div class="stamp-col">${stamp}</div></li>`;
  }).join('') + '</ol></div>';
  ui.view.innerHTML = html;
}

function renderTodo() {
  const now = today();
  const tomorrow = addDays(now, 1);
  const endOfWeek = addDays(mondayOf(now), 6);
  const todos = state.data.todos;
  const groups = [
    ['overdue', todo => todo.deadline && todo.deadline < now],
    ['today', todo => todo.deadline === now],
    ['tomorrow', todo => todo.deadline === tomorrow],
    ['this week', todo => todo.deadline && todo.deadline > tomorrow && todo.deadline <= endOfWeek],
    ['later', todo => todo.deadline && todo.deadline > endOfWeek && todo.deadline > tomorrow],
    ['no deadline', todo => !todo.deadline],
  ];
  const overdueCount = todos.filter(groups[0][1]).length;

  let html = `<div class="todo"><pre class="bucket-head">to do
${'═'.repeat(5)}
${todos.length} open${overdueCount ? `, ${overdueCount} overdue` : ''}</pre>`;
  if (!todos.length) html += `<pre class="empty">
     ┌───┐
     │ ✓ │    all done.
     └───┘    add one with: todo add Pay rent fri
</pre>`;

  for (const [groupName, belongsInGroup] of groups) {
    const inGroup = todos.filter(belongsInGroup);
    if (!inGroup.length) continue;
    html += `<div class="todo-group${groupName === 'overdue' ? ' overdue' : ''}"><span>${groupName} </span><span class="fill">${lineOf('─')}</span></div><ul>`;
    html += inGroup.map(todo => {
      const repeat = todo.repeat_type && todo.repeat_type !== 'none'
        ? `<span class="rep" title="${REPEAT_WORDS[todo.repeat_type]}">↻ ${todo.repeat_type}</span> ` : '';
      const due = todo.deadline ? `${DAY_NAMES[weekdayIndex(todo.deadline)]} ${escapeHtml(shortDate(todo.deadline))}` : '';
      const notes = todo.notes ? `<span class="notes">${noteLines(todo.notes).map((note, index) => {
        const checkbox = note.match(/^\[([ x])\] (.*)$/);
        if (!checkbox) return `<span class="note-line">${escapeHtml(note)}</span>`;
        const ticked = checkbox[1] === 'x';
        return `<span class="note-line${ticked ? ' ticked' : ''}"><span class="tick" data-tick-kind="todo" data-tick-id="${todo.id}" data-tick-note="${index + 1}">[${ticked ? 'x' : ' '}]</span> ${escapeHtml(checkbox[2])}</span>`;
      }).join('')}</span>` : '';
      return `<li><span class="box" data-done="${todo.id}" title="done">[ ]</span><span class="n">#${todo.id}</span>` +
        `<span class="t"><span class="title" data-edit="${todo.id}">${escapeHtml(todo.title)}</span>${notes}</span>` +
        `<span class="due">${repeat}${due}</span>` +
        `<button type="button" class="done-btn" data-done="${todo.id}">[ done ]</button></li>`;
    }).join('');
    html += '</ul>';
  }
  ui.view.innerHTML = html + '</div>';
}

function render() {
  if (state.view === 'm' || isListView()) {
    const rangeKey = state.view + visibleRange()[0];
    if (state.scrolledFor !== rangeKey) {
      state.scrolledFor = rangeKey;
      requestAnimationFrame(() => { ui.view.scrollTop = 0; });
    }
  }
  if (!APP.loggedIn) ui.view.innerHTML = '';
  else if (state.view === 'bucket') renderBucket();
  else if (state.view === 'todo') renderTodo();
  else if (state.view === 'm') renderMonth();
  else renderGrid();
  renderStatus();
}

function runFromClick(line) {
  markAnswerStart();
  runLine(line).then(() => { scrollToAnswer(); refreshPrompt(); });
}

ui.view.addEventListener('click', event => {
  const tickBox = event.target.closest('[data-tick-kind]');
  if (tickBox) {
    const { tickKind, tickId, tickNote } = tickBox.dataset;
    runFromClick(tickKind === 'todo' ? `todo tick ${tickId} ${tickNote}` : `tick ${tickId} ${tickNote}`);
    return;
  }

  const doneButton = event.target.closest('[data-done]');
  if (doneButton) {
    markAnswerStart();
    runLine(`todo done ${doneButton.dataset.done}`).then(() => { scrollToAnswer(); refreshPrompt(); });
    return;
  }

  const todoTitle = event.target.closest('[data-edit]');
  if (todoTitle) {
    runFromClick(`todo edit ${todoTitle.dataset.edit}`);
    return;
  }

  const allDayLine = event.target.closest('.allday-line');
  if (allDayLine) {
    runLine(`show ${allDayLine.dataset.id}`);
    return;
  }

  if (event.target.closest('.todo-line')) {
    event.stopPropagation();
    state.view = 'todo';
    render();
    return;
  }

  const planElement = event.target.closest('.ev');
  if (planElement) { runLine(`show ${planElement.dataset.id}`); return; }

  const monthCell = event.target.closest('.cell');
  if (monthCell) {
    state.cursor = monthCell.dataset.date;
    state.view = 'd';
    render();
    return;
  }

  const dayColumn = event.target.closest('.col');
  if (dayColumn) {
    const column = dayColumn.getBoundingClientRect();
    const clicked = (event.clientY - column.top) / column.height * MINUTES_PER_DAY;
    const startMinutes = Math.min(MINUTES_PER_DAY - 5, Math.max(0, Math.floor(clicked / 5) * 5));
    const endMinutes = Math.min(MINUTES_PER_DAY, startMinutes + 60);
    const endTime = endMinutes === MINUTES_PER_DAY ? '24:00' : toTime(endMinutes);
    ui.input.value = `add  ${typedDate(dayColumn.dataset.date)} ${toTime(startMinutes)}-${endTime}`;
    ui.input.focus();
    ui.input.setSelectionRange(4, 4);
    refreshPrompt();
  }
});

ui.view.addEventListener('dblclick', event => {
  const planElement = event.target.closest('.ev, .allday-line');
  if (planElement) runFromClick(`edit ${planElement.dataset.id}`);
});

state.cursor = today();
render();
refreshPrompt();
if (matchMedia('(pointer: fine)').matches) ui.input.focus();

function everyMinute() {
  const scrollPosition = ui.view.scrollTop;
  if (APP.loggedIn && !isListView() && state.view !== 'm') {
    renderGrid();
    ui.view.scrollTop = scrollPosition;
  }
  renderStatus();
  setTimeout(everyMinute, 60000 - Date.now() % 60000 + 50);
}
setTimeout(everyMinute, 60000 - Date.now() % 60000 + 50);
addEventListener('visibilitychange', () => { if (!document.hidden) { renderStatus(); if (APP.loggedIn && !isListView() && state.view !== 'm') renderGrid(); } });

let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (APP.loggedIn && ['d', '3', 'w'].includes(state.view)) renderGrid();
  }, 150);
});

if (APP.loggedIn) {
  print(`${APP.lastLogin ? `last login ${APP.lastLogin}. ` : ''}type help to see all commands`, 'dim');
  callServer('state').catch(error => printError(error.message));
}