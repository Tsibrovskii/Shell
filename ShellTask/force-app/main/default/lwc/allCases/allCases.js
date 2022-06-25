import { LightningElement, wire, track } from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases'; '@salesforce/apex/CaseController.getAccounts';

export default class AllCases extends LightningElement {
  @track
  records;

  @wire(getCases)
  allCases({error, data}) {
    if (data) {
      this.records = data;
    } else if (error) {
      this.error = error;
    }
  }
}