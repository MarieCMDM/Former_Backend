const bcrypt = require("bcrypt");
const express  = require('express');
const router   = express.Router();
const db       = require('../database/query_builder.js');

/**
 * Return a custom response based on the result of the query 
 * for the request, 
 * the request must be like: 
 * {"email": "email@email.com",	"password": "email"}
 * the responses are:
 * {"status": "Login falied, No user with given email"} if theres no email in the database
 * {"status": "Login successfull"} if email and password are correct
 * {"status": "Login falied, Wrong Password"} if the email is correct but the password don't match 
 */
router.post('/login', async (req, res) => {
  let credentials;

  if (Object.keys(req.body).length) { 

    credentials = req.body;

  } else {

    credentials = req.query;

  }
  
  try {
    
    const password = await db.performQuery(db.getPassword(credentials.email));
    
    if (password.rowCount == 0 ){

      res.status(200).send('{"status": "Login falied, No user with given email"}');

    } else {
        
      const hashed = await bcrypt.compare(credentials.password, password.rows[0].password);
      
      if (hashed) {

        res.status(200).send('{"status": "Login successfull"}')

      } else {

        res.status(200).send('{"status": "Login falied, Wrong Password"}');

      }
    }

  } catch (err) {

    res.status(400).send(err);

  }
});

module.exports = router;