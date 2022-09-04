public with sharing class CaseController {
    
    @AuraEnabled(cacheable = true)
    public static List<Case> getCases() {
        System.debug('we are here');
        return [
            SELECT Id, CaseNumber, Status, CreatedDate, Priority, Skills__c, Owner.Name
            FROM Case
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<account>  getAccountList(){
        return [SELECT Id, Name,Phone,Industry FROM Account order by createddate desc LIMIT 15];
    }
}