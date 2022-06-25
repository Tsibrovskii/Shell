import { api, LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CaseRecord extends NavigationMixin(LightningElement) {
  @api record;

  viewCase() {
    this[NavigationMixin.GenerateUrl]({
        type: 'standard__recordPage',
        attributes: {
            "recordId": this.record.Id,
            "objectApiName": "Case",
            "actionName": "view"
        },
    }).then(url => {window.open(url)});
  }
}