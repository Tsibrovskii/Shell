import { LightningElement, wire, track } from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases'; '@salesforce/apex/CaseController.getAccounts';

export default class AllCases extends LightningElement {
  @track
  records = [];

  initialRecords = [];
  typingTimer;
  filter;

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

    const temp = this.initialRecords.filter(record => {
      const value = Object.values(record).find(val => {
        return val.toLowerCase().includes(this.filter)
      });
      return !!value;
    });
    this.records = temp;
  }
}