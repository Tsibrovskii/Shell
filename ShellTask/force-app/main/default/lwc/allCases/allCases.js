import { LightningElement, wire, track } from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases'; '@salesforce/apex/CaseController.getAccounts';

export default class AllCases extends LightningElement {
  @track
  records = [];

  initialRecords = [];
  typingTimer;
  filter;
  sortedColumn;
  sortedDirection = "asc";

  @wire(getCases)
  allCases({error, data}) {
    if (data) {
      this.initialProcessRecords(data);
    } else if (error) {
      this.error = error;
    }
  }

  initialProcessRecords = (data) => {
    this.initialRecords = data.map(record => {
      return {...record, CreatedDate: record.CreatedDate.slice(0, 10)}
    });
    this.records = this.initialRecords;
  }

  filterRecords = (event) => {
    this.filter = event.target.value && event.target.value.toLowerCase();
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.processFilter();
    }, 300);
  }

  processFilter = () => {
    if (!this.filter) {
      this.records = this.initialRecords;
      return;
    }

    this.records = this.initialRecords.filter(record => {
      const value = Object.values(record).find(val => {
        return val.toLowerCase().includes(this.filter)
      });
      return !!value;
    });
  }

  sortRecords = (event) => {
    let colName = event.target.title;
    if (this.sortedColumn === colName) {
      this.sortedDirection = (this.sortedDirection === "asc" ? "desc" : "asc");
    } else {
      this.sortedDirection = "asc";
    }

    let isReverse = this.sortedDirection === "asc" ? 1 : -1;

    this.sortedColumn = colName;

    this.records = [];
    this.records = this.initialRecords.sort((a, b) => {
      a = a[colName] ? a[colName].toLowerCase() : "";
      b = b[colName] ? b[colName].toLowerCase() : "";
      return a > b ? 1 * isReverse : -1 * isReverse;
    });
  }
}