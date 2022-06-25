public with sharing class CaseController {
    
    @AuraEnabled(cacheable = true)
    public static List<Case> getCases() {
        return [
            SELECT Id, CaseNumber, Status, CreatedDate, Priority, Skills__c
            FROM Case
        ];
    }
}
