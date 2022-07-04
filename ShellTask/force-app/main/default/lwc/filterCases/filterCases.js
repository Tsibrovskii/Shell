import { LightningElement } from 'lwc';

export default class FilterCases extends LightningElement {

  search;
  startDate;
  endDate;
  status;
  priority;

  get statusOptions() {
    return [
      {label: "--None--", value: "--None--"},
      {label: "New", value: "New"},
      {label: "Working", value: "Working"},
      {label: "Escalated", value: "Escalated"}
    ];
  }

  get priorityOptions() {
    return [
      {label: "--None--", value: "--None--"},
      {label: "High", value: "High"},
      {label: "Medium", value: "Medium"},
      {label: "Low", value: "Low"}
    ];
  }

  handleStartDateChange = (event) => {
    this.clearSearch();
    this.startDate = event.target.value;
    this.dispatchEvent(new CustomEvent('startdatechanged', {
      detail: this.startDate
    }));
  }

  handleEndDateChange = (event) => {
    this.clearSearch();
    this.endDate = event.target.value;
    this.dispatchEvent(new CustomEvent('enddatechanged', {
      detail: this.endDate
    }));
  }

  handleStatusChange(event) {
    this.clearSearch();
    this.status = event.target.value;
    this.dispatchEvent(new CustomEvent('statuschanged', {
      detail: this.status
    }));
  }

  handlePriorityChange(event) {
    this.clearSearch();
    this.priority = event.target.value;
    this.dispatchEvent(new CustomEvent('prioritychanged', {
      detail: this.priority
    }));
  }

  handleSearchChange = (event) => {
    this.search = event.target.value && event.target.value.toLowerCase();
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('searchchanged', {
        detail: this.search
      }));
    }, 300);
  }

  clearSearch = () => {
    this.template.querySelector('lightning-input[data-name="search"]').value = null;
    this.search = null;
  }
}