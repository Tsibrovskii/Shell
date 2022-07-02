import {LightningElement, wire, track} from 'lwc';
import getCases from '@salesforce/apex/CaseController.getCases';
import {loadScript} from 'lightning/platformResourceLoader';
import JSPDF from '@salesforce/resourceUrl/jspdf';

export default class AllCases extends LightningElement {
  @track
  records = [];

  initialRecords = [];
  typingTimer;
  filter;
  isLoaded = true;
  sortColumnName;
  isReverse;

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

  filterRecords = (event) => {
    this.filter = event.target.value && event.target.value.toLowerCase();
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.processFilter();
    }, 300);
  }

  processFilter = () => {
    if (!this.filter && !this.records.length) {
      this.records = this.initialRecords;
      return;
    }

    this.records = this.initialRecords.filter(record => {
      const value = Object.values(record).find(val => {
        return val.toLowerCase().includes(this.filter)
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