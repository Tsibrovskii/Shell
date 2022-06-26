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
  sortedColumn;
  sortedDirection = "asc";

  headers = [
    {
      id: "CaseNumber",
      name: "CaseNumber",
      prompt: "Case Number",
      width: 50,
      align: "center",
      padding: 0
    },
    {
      id: "Status",
      name: "Status",
      prompt: "Status",
      width: 50,
      align: "center",
      padding: 0
    },
    {
      id: "CreatedDate",
      name: "CreatedDate",
      prompt: "Date Opened",
      width: 50,
      align: "center",
      padding: 0
    },
    {
      id: "Skills__c",
      name: "Skills__c",
      prompt: "Skills",
      width: 50,
      align: "center",
      padding: 0
    },
    {
      id: "Priority",
      name: "Priority",
      prompt: "Priority",
      width: 50,
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