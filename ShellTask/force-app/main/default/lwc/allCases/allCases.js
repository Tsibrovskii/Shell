import {LightningElement, wire, track} from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases';
import getLatestAccounts from '@salesforce/apex/CaseController.getAccountList';
import {loadScript} from 'lightning/platformResourceLoader';
import JSPDF from '@salesforce/resourceUrl/jsPdf';
import {subscribe, createMessageContext} from 'lightning/messageService';
import SAMPLEMC from "@salesforce/messageChannel/Sample__c";
import {refreshApex} from "@salesforce/apex";
import { deleteRecord } from 'lightning/uiRecordApi';

const COLS = [
  { label: 'Name', fieldName: 'Name', type: 'text' },
  { label: 'Stage', fieldName: 'Phone', type: 'text' },
  { label: 'Amount', fieldName: 'Industry', type: 'text' }
];

export default class AllCases extends LightningElement {
  cols = COLS;
  @track selectedRecord;
  @track accountList = [];
  @track error;
  @track wiredAccountList = [];
  @wire(getLatestAccounts) accList(result) {
    this.wiredAccountList = result;

    if (result.data) {
      this.accountList = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.accountList = [];
    }
  }

  handelSelection(event) {
    if (event.detail.selectedRows.length > 0) {
      this.selectedRecord = event.detail.selectedRows[0].Id;
    }
  }
  deleteRecord() {
    deleteRecord(this.selectedRecord)
      .then(() => {
        refreshApex(this.wiredAccountList);
      })
      .catch(error => {
      })
  }

  @track
  records = [];
  filteredRecords = [];
  initialRecords = [];

  context = createMessageContext();
  subscription = null;

  typingTimer;
  isLoaded = true;
  sortColumnName;
  isReverse;

  search;
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

  recordsRefresh;

  

  connectedCallback() {
    this.subscribeMC();
  }

  subscribeMC() {
    if (this.subscription) {
        return;
    }
    this.subscription = subscribe(this.context, SAMPLEMC, (message) => {
      refreshApex(this.wrapperRecords); 
      console.log('this is records after refresh', this.recordsRefresh);
    });
  }

  refr() {
    refreshApex(this.wiredAccountList);
    console.log('this is records after refresh', this.wiredAccountList);
  }

  @wire(getCases)
  allCases(result) {
    this.recordsRefresh = result;
    if (result.data) {
      this.recordsRefresh = result.data;
      this.initialProcessRecords(result.data);
    } else if (result.error) {
      this.error = result.error;
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
    this.startDate = event.detail;
    this.filterCases();
  }

  handleEndDateChange = (event) => {
    this.endDate = event.detail;
    this.filterCases();
  }

  handleStatusChange(event) {
    this.status = event.detail;
    this.filterCases();
  }

  handlePriorityChange(event) {
    this.priority = event.detail;
    this.filterCases();
  }

  handleSearchChange = (event) => {
    this.search = event.detail;
    this.processSearch();
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
}