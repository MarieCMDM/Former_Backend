const express = require('express');
const router  = express.Router();
const db      = require('../database/query_builder.js');


/**
 * get the list of all users
 */
router.get('/', async (req, res, next) => {
  const {name, last_name, birth_date, gender, email} = req.query;

  try{

    const users = await db.performQuery(db.getUsers());
    let result  = users.rows;

    if (name) {

      result = result.filter(r => r.name === name);
    
    }

    if (last_name) {
    
      result = result.filter(r => r.last_name === last_name);
    
    }

    if (birth_date) {
    
      result = result.filter(r => r.birth_date === birth_date);
    
    }

    if (gender) {
    
      result = result.filter(r => r.gender === gender);
    
    }

    if (email) {
    
      result = result.filter(r => r.email === email);
    
    }
    
    res.status(200).send(result);

  } catch (err) {
    
    res.status(400).send(err);
  
  }
});


/**
 * get the user with the given id
 */
router.get('/:user_id', async (req, res, next) => {
  const { user_id } = req.params;
 
  try{

    const users = await db.performQuery(db.getUserById(user_id));
    res.status(200).send(users.rows)

  } catch (err) {

    res.status(400).send(err);
  
  }
});


/**
 * add a new user to the database
 * the request must be :
 * {"name": "", "last_name": "", "birth_date": "", "gender": "", "email": "",	"password": ""}
 */
router.post('/singup', async (req, res) => {
  let user_data;

  if (Object.keys(req.body).length) { 

    user_data = req.body;
  
  } else {
  
    user_data = req.query;
  
  }
  
  try {

    const email = await db.performQuery(db.getEmail(user_data.email));

    if (email.rowCount == 0) {
      try {

        const usr = await db.performQuery(await db.addUser(user_data));
        res.status(200).send('{"status": "New user is added to the database"}');

      } catch (err) {
     
        res.status(400).send(err);
      
      }

    } else {
    
      res.status(200).send('{"status": "Email already exist"}');
    
    } 

  } catch (err) {
  
    res.status(400).send(err);
  
  }

});


/**
 * get the list of forms submitted by the uset with the given id
 */
router.get('/:user_id/forms_submitted', async (req, res, next) => {
  const { user_id } = req.params;
  const { form_id } = req.query;

  try{

    const forms = await db.performQuery(db.getFormsSubmittedByUser(user_id));
    let result  = forms.rows;

    if (form_id) {

      result = result.filter(r => r.form_id == form_id);
    
    }
    
    res.status(200).send(result);

  } catch (err) {
    
    res.status(400).send(err);
  
  }
});


/**
 * get the answers of the form with the given form id for the user with given form id
 */
router.get('/:user_id/:form_id/answers', async (req, res, next) => {
const { user_id, form_id } = req.params;

  try {

    const answers = await db.performQuery(db.getAnswers(form_id, user_id));
    res.status(200).send(answers.rows);

  } catch (err) {

    res.status(400).send(err);
  
  }
});

module.exports = router;
