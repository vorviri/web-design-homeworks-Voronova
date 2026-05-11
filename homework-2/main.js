import { Dashboard } from './js/Dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new Dashboard('#dashboard-grid', '#empty-state');
  
  document.getElementById('add-todo').addEventListener('click', () => dashboard.addWidget('todo'));
  document.getElementById('add-quote').addEventListener('click', () => dashboard.addWidget('quote'));
  document.getElementById('add-currency').addEventListener('click', () => dashboard.addWidget('currency'));
  document.getElementById('add-palette').addEventListener('click', () => dashboard.addWidget('palette'));
  
  document.getElementById('add-deadlines').addEventListener('click', () => {
    dashboard.addWidget('deadlines');
  });
});