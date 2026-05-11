const initialData = {
classes: {
yoga: { name: "Утренняя йога", duration: 60, maxCapacity: 10 },
hiit: { name: "HIIT тренировка", duration: 45, maxCapacity: 8 },
pilates: { name: "Пилатес", duration: 60, maxCapacity: 10 },
strength: { name: "Силовая", duration: 50, maxCapacity: 9 }
},
scheduleByDay: {
1: [{ time: "10:00", classId: "yoga" }, { time: "12:00", classId: "hiit" }, { time: "18:00", classId: "pilates" }],
2: [{ time: "10:00", classId: "pilates" }, { time: "18:00", classId: "strength" }, { time: "19:00", classId: "yoga" }],
3: [{ time: "17:00", classId: "hiit" }, { time: "18:00", classId: "yoga" }, { time: "19:00", classId: "strength" }],
4: [{ time: "10:00", classId: "pilates" }, { time: "14:00", classId: "hiit" }, { time: "18:00", classId: "yoga" }],
5: [{ time: "11:00", classId: "strength" }, { time: "12:00", classId: "yoga" }, { time: "17:00", classId: "hiit" }],
6: [{ time: "11:00", classId: "yoga" }, { time: "12:00", classId: "pilates" }],
0: [{ time: "11:00", classId: "yoga" }, { time: "12:00", classId: "hiit" }]
}
};

const Storage = {
key: "luna_bookings",
load() {
const raw = localStorage.getItem(this.key);
return raw ? JSON.parse(raw) : {};
},
save(data) {
localStorage.setItem(this.key, JSON.stringify(data));
},
getBookings(dateStr) {
return this.load()[dateStr] || {};
},
addBooking(dateStr, time, user) {
const all = this.load();
if (!all[dateStr]) all[dateStr] = {};
if (!all[dateStr][time]) all[dateStr][time] = [];
all[dateStr][time].push(user);
this.save(all);
},
getBookedCount(dateStr, time) {
return this.getBookings(dateStr)[time]?.length || 0;
}
};

const DateUtils = {
formatDate(d) {
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
},
getWeekDays(baseDate) {
const current = new Date(baseDate);
const day = current.getDay();
const diff = current.getDate() - day + (day === 0 ? -6 : 1);
const monday = new Date(current.setDate(diff));
const days = [];
for (let i = 0; i < 7; i++) {
const d = new Date(monday);
d.setDate(monday.getDate() + i);
days.push(d);
}
return days;
},
isPast(dateStr) {
const [y, m, d] = dateStr.split("-");
const target = new Date(y, m - 1, d);
const today = new Date();
today.setHours(0, 0, 0, 0);
return target < today;
}
};

const App = {
currentWeekStart: new Date(),
selectedDate: null,
selectedSlot: null,
init() {
this.cacheDOM();
this.bindEvents();
this.renderWeekCalendar();
},
cacheDOM() {
this.prevWeekBtn = document.getElementById("prevWeek");
this.nextWeekBtn = document.getElementById("nextWeek");
this.weekDaysContainer = document.getElementById("weekDays");
this.dateTitle = document.getElementById("selectedDateTitle");
this.slotsList = document.getElementById("slotsList");
this.form = document.getElementById("bookingForm");
this.cancelBtn = document.getElementById("cancelBooking");
this.messageEl = document.getElementById("bookingMessage");
this.nameInput = document.getElementById("userName");
this.phoneInput = document.getElementById("userPhone");
},
bindEvents() {
this.prevWeekBtn.addEventListener("click", () => this.changeWeek(-1));
this.nextWeekBtn.addEventListener("click", () => this.changeWeek(1));
this.cancelBtn.addEventListener("click", () => this.resetForm());
this.form.addEventListener("submit", (e) => this.handleBooking(e));
},
changeWeek(dir) {
this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (dir * 7));
this.renderWeekCalendar();
this.resetSelection();
},
renderWeekCalendar() {
const days = DateUtils.getWeekDays(this.currentWeekStart);
this.weekDaysContainer.innerHTML = "";
const todayStr = DateUtils.formatDate(new Date());
days.forEach(date => {
const dateStr = DateUtils.formatDate(date);
const isPast = DateUtils.isPast(dateStr);
const isSelected = dateStr === this.selectedDate;
const dayEl = document.createElement("div");
dayEl.className = `day-item ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`;
dayEl.innerHTML = `
<span class="day-name">${date.toLocaleDateString('ru-RU', {weekday: 'short'})}</span>
<span class="day-num">${date.getDate()}</span>
`;
if (!isPast) {
dayEl.addEventListener("click", () => this.selectDate(dateStr, dayEl));
}
this.weekDaysContainer.appendChild(dayEl);
});
},
selectDate(dateStr, dayEl) {
document.querySelectorAll(".day-item").forEach(el => el.classList.remove("selected"));
dayEl.classList.add("selected");
this.selectedDate = dateStr;
this.dateTitle.textContent = `Занятия на ${this.formatDateRu(dateStr)}`;
this.renderSlots(dateStr);
this.resetForm();
},
formatDateRu(str) {
const [y, m, d] = str.split("-");
return `${d}.${m}.${y}`;
},
renderSlots(dateStr) {
this.slotsList.innerHTML = "";
const dayOfWeek = new Date(dateStr + "T00:00:00").getDay();
const slots = (initialData.scheduleByDay[dayOfWeek] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
slots.forEach(slot => {
const cls = initialData.classes[slot.classId];
const booked = Storage.getBookedCount(dateStr, slot.time);
const available = cls.maxCapacity - booked;
const isFull = available <= 0;
const li = document.createElement("li");
li.className = "slot";
li.innerHTML = `
<div class="slot__time">${slot.time}</div>
<div class="slot__info">
<h4>${cls.name}</h4>
<span>${cls.duration} мин</span>
</div>
<div class="slot__meta">
<div class="slot__capacity">${available}/${cls.maxCapacity}</div>
<button class="btn btn--primary slot__btn" ${isFull ? 'disabled' : ''}>
${isFull ? "НЕТ МЕСТ" : "ЗАПИСАТЬСЯ"}
</button>
</div>
`;
if (!isFull) {
li.querySelector("button").addEventListener("click", () => this.openBookingForm(slot, cls));
}
this.slotsList.appendChild(li);
});
},
openBookingForm(slot, cls) {
this.selectedSlot = { ...slot, className: cls.name, maxCapacity: cls.maxCapacity };
this.form.classList.remove("hidden");
this.messageEl.classList.add("hidden");
this.nameInput.value = "";
this.phoneInput.value = "";
this.nameInput.focus();
},
resetForm() {
this.form.classList.add("hidden");
this.messageEl.classList.add("hidden");
this.nameInput.value = "";
this.phoneInput.value = "";
this.selectedSlot = null;
},
resetSelection() {
this.selectedDate = null;
this.slotsList.innerHTML = "";
this.dateTitle.textContent = "Выберите дату";
this.resetForm();
},
handleBooking(e) {
e.preventDefault();
if (!this.selectedSlot || !this.selectedDate) return;
const name = this.nameInput.value.trim();
const phone = this.phoneInput.value.trim();
if (!name || !phone) return;
const bookings = Storage.getBookings(this.selectedDate);
const timeBookings = bookings[this.selectedSlot.time] || [];
const alreadyBooked = timeBookings.some(b => b.phone === phone);
if (alreadyBooked) {
this.showMessage("Этот номер уже записан", "error");
return;
}
if (Storage.getBookedCount(this.selectedDate, this.selectedSlot.time) >= this.selectedSlot.maxCapacity) {
this.showMessage("Места закончились", "error");
this.renderSlots(this.selectedDate);
return;
}
Storage.addBooking(this.selectedDate, this.selectedSlot.time, { name, phone });
this.showMessage(`✅ ${name}, вы записаны на ${this.selectedSlot.className}`, "success");
this.renderSlots(this.selectedDate);
setTimeout(() => this.resetForm(), 2500);
},
showMessage(text, type) {
this.messageEl.textContent = text;
this.messageEl.className = `message message--${type}`;
this.messageEl.classList.remove("hidden");
}
};

document.addEventListener("DOMContentLoaded", () => App.init());