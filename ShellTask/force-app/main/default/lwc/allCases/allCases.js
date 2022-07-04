import {LightningElement, wire, track} from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases';
import {loadScript} from 'lightning/platformResourceLoader';
import JSPDF from '@salesforce/resourceUrl/jspdf';

export default class AllCases extends LightningElement {
  @track
  records = [];
  filteredRecords = [];
  initialRecords = [];
  typingTimer;
  search;
  isLoaded = true;
  sortColumnName;
  isReverse;
  startDate;
  endDate;
  status;
  priority;

  headers = [
    {
      id: "CaseNumber",
      name: "CaseNumber",
      prompt: "Case Number",
      width: 42,
      align: "center",
      padding: 0
    },
    {
      id: "Owner",
      name: "Owner",
      prompt: "Case Owner",
      width: 42,
      align: "center",
      padding: 0
    },
    {
      id: "Status",
      name: "Status",
      prompt: "Status",
      width: 42,
      align: "center",
      padding: 0
    },
    {
      id: "CreatedDate",
      name: "CreatedDate",
      prompt: "Date Opened",
      width: 42,
      align: "center",
      padding: 0
    },
    {
      id: "Skills__c",
      name: "Skills__c",
      prompt: "Skills",
      width: 42,
      align: "center",
      padding: 0
    },
    {
      id: "Priority",
      name: "Priority",
      prompt: "Priority",
      width: 42,
      align: "center",
      padding: 0
    }
  ];

  @wire(getCases)
  allCases({error, data}) {
    if (data) {
      this.initialProcessRecords(data);
    } else if (error) {
      this.error = error;
    }
    this.isLoaded = !this.isLoaded;
  }

  initialProcessRecords = (data) => {
    this.initialRecords = data.map(record => {
      return {...record, CreatedDate: record.CreatedDate.slice(0, 10), Owner: record.Owner && record.Owner.Name}
    });
    this.filteredRecords = this.initialRecords;
    this.records = this.initialRecords;
  }

  renderedCallback() {
    Promise.all([loadScript(this, JSPDF)]);
  }

  generatePdf = () => {
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF();

    doc.text("All Cases", 92, 10);
    doc.table(10, 20, this.records, this.headers, {autosize:true});
    doc.save("Cases.pdf");
  }

  handleStartDateChange = (event) => {
    this.startDate = event.target.value;
    this.filterCases();
  }

  handleEndDateChange = (event) => {
    this.endDate = event.target.value;
    this.filterCases();
  }

  handleStatusChange(event) {
    this.status = event.target.value;
    this.filterCases();
  }

  handlePriorityChange(event) {
    this.priority = event.target.value;
    this.filterCases();
  }

  handleSearchChange = (event) => {
    this.search = event.target.value && event.target.value.toLowerCase();
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.processSearch();
    }, 300);
  }

  filterCases = () => {
    this.filteredRecords = this.initialRecords
      .filter(record => {
        return !this.startDate || record.CreatedDate >= this.startDate;
      })
      .filter(record => {
        return !this.endDate || record.CreatedDate <= this.endDate;
      })
      .filter(record => {
        return !this.status || this.status === "--None--" || record.Status == this.status;
      })
      .filter(record => {
        return !this.priority || this.priority === "--None--" || record.Priority == this.priority;
      });
    this.records = this.filteredRecords;
    this.processSort();
  }

  processSearch = () => {
    if (!this.search && !this.records.length) {
      this.records = this.filteredRecords;
      this.processSort();
      return;
    }

    this.records = this.filteredRecords.filter(record => {
      const value = Object.values(record).find(val => {
        return val.toLowerCase().includes(this.search)
      });
      return !!value;
    });
    this.processSort();
  }

  sortRecords = (event) => {
    this.sortColumnName = event.detail.sortedColumn;
    this.isReverse = event.detail.sortedDirection === "asc" ? 1 : -1;

    this.processSort();
  }

  processSort = () => {
    this.records.sort((a, b) => {
      a = a[this.sortColumnName] ? a[this.sortColumnName].toLowerCase() : "";
      b = b[this.sortColumnName] ? b[this.sortColumnName].toLowerCase() : "";
      return a > b ? 1 * this.isReverse : -1 * this.isReverse;
    });
  }

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
}