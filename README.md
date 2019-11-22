# bettapoint_test
A bried software engineering test involving creation of a transaction service.

### This service consists of two microservices
1. user : /user \n
a. / - gets all users \n
b. /add - add a user \n
c. /:email - get user by email \n
d. /update/:email - update user by email \n

2. transaction: /transaction \n
a. / - gets all transaction logs \n
b. /start - initiate a transaction and send OTP \n
c. /end - complete a transaction by provideing sent OTP \n
