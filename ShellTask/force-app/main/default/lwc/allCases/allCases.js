import { LightningElement, wire, track } from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases'; '@salesforce/apex/CaseController.getAccounts';

export default class AllCases extends LightningElement {
  @track
  records;
  initialRecords;

  @wire(getCases)
  allCases({error, data}) {
    if (data) {
      this.initialRecords = data;
      this.processRecords();
    } else if (error) {
      this.error = error;
    }
  }

  processRecords = () => {
    this.records = this.initialRecords.map(record => {
      return {...record, CreatedDate: record.CreatedDate.slice(0, 10)}
    });
  }
}