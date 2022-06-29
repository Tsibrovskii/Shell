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
  isLoaded = true;

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

  renderedCallback() {
    Promise.all([loadScript(this, JSPDF)]);
  }

  get classCaseNumberAsc() {
    return this.sortedColumn === 'CaseNumber' && this.sortedDirection === 'asc'? '' : 'displayNone';
  }

  get classCaseNumberDesc() {
    return this.sortedColumn === 'CaseNumber' && this.sortedDirection === 'desc'? '' : 'displayNone';
  }

  get classCaseOwnerAsc() {
    return this.sortedColumn === 'Owner' && this.sortedDirection === 'asc'? '' : 'displayNone';
  }

  get classCaseOwnerDesc() {
    return this.sortedColumn === 'Owner' && this.sortedDirection === 'desc'? '' : 'displayNone';
  }

  get classStatusAsc() {
    return this.sortedColumn === 'Status' && this.sortedDirection === 'asc'? '' : 'displayNone';
  }

  get classStatusDesc() {
    return this.sortedColumn === 'Status' && this.sortedDirection === 'desc'? '' : 'displayNone';
  }

  get classCreatedDateAsc() {
    return this.sortedColumn === 'CreatedDate' && this.sortedDirection === 'asc'? '' : 'displayNone';
  }

  get classCreatedDateDesc() {
    return this.sortedColumn === 'CreatedDate' && this.sortedDirection === 'desc'? '' : 'displayNone';
  }

  get classSkillsAsc() {
    return this.sortedColumn === 'Skills__c' && this.sortedDirection === 'asc'? '' : 'displayNone';
  }

  get classSkillsDesc() {
    return this.sortedColumn === 'Skills__c' && this.sortedDirection === 'desc'? '' : 'displayNone';
  }

  get classPriorityAsc() {
    return this.sortedColumn === 'Priority' && this.sortedDirection === 'asc'? '' : 'displayNone';
  }

  get classPriorityDesc() {
    return this.sortedColumn === 'Priority' && this.sortedDirection === 'desc'? '' : 'displayNone';
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
      return {...record, CreatedDate: record.CreatedDate.slice(0, 10), Owner: record.Owner.Name}
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

    this.records.sort((a, b) => {
      a = a[colName] ? a[colName].toLowerCase() : "";
      b = b[colName] ? b[colName].toLowerCase() : "";
      return a > b ? 1 * isReverse : -1 * isReverse;
    });
  }
}