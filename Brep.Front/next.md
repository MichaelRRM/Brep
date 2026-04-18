
no error handing for apis at all currently 


from claude: 
  One subtle issue: params only exposes day from now, not hour/minute. Within the same day, getDate() is stable, but the
   computed still produces a new object reference on every now change (because it's a new {} literal), so toObservable
  emits regardless. It works, but it's relying on reference inequality rather than value change. If you wanted to be
  explicit you could add hour and minute to params, or just leave it — it's fine for a prototype.


I want directions to deploy this, as a prototype, on azure. 
Some elements: 
- free tier only or as close to possible. 
- i want it open to my ip only, as well as the ip of a partner I will get later 
- the back end will need access to the nexalis api it is using 
- in the first version no authentication/ authorisation and token in the settings file is acceptable 
- code is on github. preference is to generate artifacts from there 
help needed: write docker files for front and back end, any file necessary for the builds and all, make any adjustment if needed, and detailed step by step walkthrough on how to deploy 

