# BACKEND INTERFACE FOR CREATE AND SUBMIT FORMS
Backend APIs for create and submit forms.

## APIs

### http://api/

- `http://api/login` 

    This API takes a POST request with email and password in the format: <br />
    ```json
    {"email": "example@example.com", "password": "example" }
    ``` 
    and Returns one of the following messages:
    ```json
    {"status": "Login falied, No user with given email"}
    ``` 
    if theres no equals email in the database 
    ```json
    {"status": "Login successfull"}
    ``` 
    if email and password are correct
    ```json
    {"status": "Login falied, Wrong Password"}
    ```
    if the email is correct but the password didn't match


### http://api/users

- `http://api/users/`

    This API takes a GET request and return the list of all users in the database in the format:

    ```json
    [ {"user_uuid": 1, "name": "name",	"last_name": "last", "birth_date": "2023-06-07", "gender": "female", "email": "test@test.com" }, {"user_uuid": 2, "name": "name", "last_name": "last",	"birth_date": "1996-07-14",	"gender": "male", "email": "test@test.mc" } ]
    ```

    Filtering is also implemented.

- `http://api/users/:user_id`

    This API takes a GET request and return the single user request by user_id and return this: 
    ```json
    [ {"name": "name", "last_name": "last", "birth_date": "2023-06-07", "gender": "female", "email": "test@test.com" } ]
    ```

- `http://api/users/singup` 

    This API takes a POST request with name, last_name, birth_date, gender, email, password and add a new User in the database 
    ```json
    {"name": "test", "last_name": "test", "birth_date": "21-02-2012", "gender": "test", "email": "test@test.com", "password": "test"}
    ``` 
    and returns one of:  
    ```json
    {"status": "New user is added to the database"}
    ``` 
    if the user is correctly added
    ```json
    {"status": "Email already exist"}
    ``` 
    if the given email already exist in the database

- `http://api/users/:user_id/forms_submitted` 

    This API takes a GET request with the user_id and return the list of forms submitted by the user as follows: 
    ```json
    [ {"form_id": 60}, {"form_id": 59} ]
    ```

- `http://api/users/:user_id/:form_id/answers` 

    This API takes a GET request with user_id and form_id and return the list of answers for the given form for the given user 
    ```json
    [ { "content": "Come ti chiami?",	"true_false": null, "multiple_choice": null, "free_text": "Marie"}, ..., {"content": "come stai?", "true_false": null, "multiple_choice": null, "free_text": "Abbastanza"	} ]
     ```

### http://api/forms

- `http://api/forms/`

    This API takes a GET request and return the list of all forms with the questions linked as follow: 
    ```json
    [{"form_id": 70,	"content": "Ti piacciono i nanoPi?", "true_false": true, "multiple_choice": "",	"free_text": false}, {"form_id": 70, "content": "Come ti chiami?","true_false": false,	"multiple_choice": "", "free_text": true}, {"form_id": 70, "content": "come stai?", "true_false": false, "multiple_choice": "",	"free_text": true}, {"form_id": 60, "content": "come la definiresti? perche?",	"true_false": false, "multiple_choice": {"choices": [{"value": "brutta"},{"value": "stupenda"},	{			"value": "accettabile"}, {"value": "vomitevole"	}]}, "free_text": true}, {"form_id": 60, "content": "ti piace questa pagina?",	"true_false": true,	"multiple_choice": "",	"free_text": false}, {"form_id": 60, "content": "come stai?", "true_false": false, "multiple_choice": "", "free_text": true	}]
    ```

- `http://api/forms/:form_id`
    
    This API takes a GET request and return the list of questions for the given form_id as the format above 

- `http://api/forms/new_form` 

    This API takes a POST request for create a new form and link it all the questions given, the request mus be: 
    ```json
    {"questions_uuid": "1,2,18,19,28"}
    ``` 
    and the response will be: 
    ```json
    {"status": "Questions added to form"}
    ``` 

- `http://api/forms/new_form_submit`

    This API takes a POST request for create new answers for the form and user given in the request, the request must be: 
    ```json
    {"user_id": "2", "form_id": "60", "answers" : [{ "free_text": "bene grazie", "question_id": "2"}, {"true_false": "true", "question_id": "2"}, {			 "multiple_coice": "accettabile", "free_text": "mi pare un po w.i.p", "question_id": "2"}]} 
    ``` 
    The answer don't require null values for the fields that are not compiled, the API will set them to 'Default', the answers can be also empty.
    the response will be: 
    ```json
    {"status": "form submitted"}
    ```

### http://api/questions

- `http://api/questions/`

    This API takes a GET request and gives the list of all questions in the database as follow:  
    ```json
    [{"question_uuid": 1, "content": "Come ti chiami?", "true_false": false, "multiple_choice": "", "free_text": true, "name": "admin"}, ... , {"question_uuid": 26,	"content": "Ti piace la trap?",	"true_false": false, "multiple_choice": {"choices": [{"value": "yeah"},	{"value": "meh"}, {"value": "bleah"}, {"value": "zzz"}]}, "free_text": false, "name": "admin"} ]
    ``` 
    true_false and free_text can be true or false and means that the question type is true_false/free_text or not, multiple choices is empty if the question don't have the multiple choice option name is the name of the user that have created the question.

    Filtering is also implemented.

- `http://api/questions/:question_id` 

    This API takes a GET request and gives the question with the given id

- `http://api/questions/new_question`

    This API takes a POST request for add a new question to the database, the request mus be: 

    ```json 
    {"content": "Ti piace la trap?", "true_false": false, "multiple_choice": "yeah, meh, bleah, zzz",  "free_text": false, "owner_id": <user_id>}
    ``` 
    content is the question itself, true_false and free_text are booelan values that represent if the question will have a true/false and/or free_text response, multiple_choice is empty if the question type must not have this option or contains the coices values as a string separated by a comma, owner_id is the id of the user that have created the question, the question will possibly have all type of responses at the same type if you will 

    the response is: 
    ```json
    {"status": "New question is added to the database"}
    ```  

### DEPENDENCIES
` express, bcrypt `

### TO DO
-> modify query builder

-> add access token

-> improve error handler 

-> documentation 

### INSTALLATION
clone the repository, enter in this folder and run `npm install`

### HOW TO RUN
`$ npm start` for run the app or `$ DEBUG=former:* npm start` for run with debug 