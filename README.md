# bettapoint_test
A bried software engineering test involving creation of a transaction service.

### This service consists of two microservices
1. user : /user  
a. / - gets all users  
b. /add - add a user  
c. /:email - get user by email  
d. /update/:email - update user by email  

2. transaction: /transaction  
a. / - gets all transaction logs  
b. /start - initiate a transaction and send OTP  
c. /end - complete a transaction by provideing sent OTP  
