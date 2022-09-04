import {LightningElement, wire, track} from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases';
import {loadScript} from 'lightning/platformResourceLoader';
import JSPDF from '@salesforce/resourceUrl/jsPdf';
import {subscribe, createMessageContext} from 'lightning/messageService';
import SAMPLEMC from "@salesforce/messageChannel/Sample__c";
import {refreshApex} from "@salesforce/apex";
export default class AllCases extends LightningElement {
  @track wiredAccountList = [];
  @wire(getCases) accList(result) {
    this.wiredAccountList = result;
    this.records = result.data;
  }

  @track records = [];

  context = createMessageContext();
  subscription = null;

  connectedCallback() {
    this.subscribeMC();
  }

  subscribeMC() {
    if (this.subscription) {
        return;
    }
    this.subscription = subscribe(this.context, SAMPLEMC, () => {
      refreshApex(this.wiredAccountList); 
    });
  }

  refr() {
    refreshApex(this.wiredAccountList);
  }
}