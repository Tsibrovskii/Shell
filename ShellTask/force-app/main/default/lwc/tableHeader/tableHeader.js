import { LightningElement } from 'lwc';

export default class TableHeader extends LightningElement {

  sortedColumn;
  sortedDirection = "asc";

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

  sortRecords = (event) => {
    let colName = event.target.title;
    if (this.sortedColumn === colName) {
      this.sortedDirection = this.sortedDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortedDirection = "asc";
      this.sortedColumn = colName;
    }

    this.dispatchEvent(new CustomEvent('sortrecords', {
      detail: {
        sortedColumn: this.sortedColumn,
        sortedDirection: this.sortedDirection
      }
    }));
  }
}