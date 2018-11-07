﻿Experiment to build an angular dashboard of tiles displaying my favorite sources of information on the web using the AWS stack. 
This is to be used as a very simple "back-end" that parses / interacts with all kinds of API end points. The ultimate goal is 
to provide public vs private dashboard that end users can customize to their own likings using sso authentication through some type
of JWT tokens, most likely using a 3rd party service such as auth-0. 

So far, it can parse results from:
1. rss feeds
2. new york times API
3. NASA picture of the day API

Currently, the sources of informations are stored in a .json file but the goal is to ultimately store them in DynamoDb so that admins at first and then users can add new ones. 

Then, then ultimately, the idea would be to give users some UI where they can add / remove / re-order their private dashboard through the use of "tags". 
