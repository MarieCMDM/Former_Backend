const express = require('express');
const router  = express.Router();
const db      = require('../database/query_builder.js');


/**
 * Get the list of all forms and parse it as a json 
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await db.performQuery(db.getForms());
    // transform the string stored in db into a json 
    let json_multi = '{"choices":[';
        
    for(let i = 0; i < result.rows.length; i++){

      if (result.rows[i].multiple_choice != '') {

        const array = result.rows[i].multiple_choice.split(",");
        for(let element of array) {

          json_multi += `{"value": "${element}"},`;

        }

        json_multi                     = json_multi.slice(0, - 1);
        json_multi                    += '] }'
        result.rows[i].multiple_choice = JSON.parse(json_multi);
        json_multi                     = '{"choices":[';

      }
    }

    res.status(200).send(result.rows); 

  } catch (err) {

    res.status(400).send(err);

  }

  
});


/**
 * Get the form with the given id and parse as a JSON
 */
router.get('/:form_id', async (req, res, next) => {
  const { form_id } = req.params
  try {

    const result = await db.performQuery(db.getFormById(form_id));

    // transform the string stored in db into a json 
    let json_multi = '{"choices":[';
    
    for(let i = 0; i < result.rows.length; i++){

      if (result.rows[i].multiple_choice != '') {

        const array = result.rows[i].multiple_choice.split(",");
        
        for (let element of array) {

          json_multi += `{"value": "${element}"},`;
        
        }
        
        json_multi                     = json_multi.slice(0, - 1);
        json_multi                    += '] }'
        result.rows[i].multiple_choice = JSON.parse(json_multi);
        json_multi                     = '{"choices":[';
      }
    }

    res.status(200).send(result.rows); 

  } catch (err) {

    res.status(400).send(err);

  }
});


/**
 * first create a new form with default value
 * then inser on the form_composition table the newest form (the one generated above) matched with the question_id
 * for each question id given in the request, 
 * request must be :
 * {"questions_uuid": "uuid1, uuid2, ..., uuidX"}
 */
router.post('/new_form', async (req, res, next) => {
  let user_data;

  if (Object.keys(req.body).length) { 

    user_data = req.body;

  } else {

    user_data = req.query;

  }


  let str_uuids       = user_data.questions_uuid;
  let str_uuids_final = str_uuids.replace(/ /g, "");
  let question_uuids  = str_uuids_final.split(",");

  //TODO ? check if question_uuid is valid

  try {

    const form_id = await db.performQuery(db.addForm());  
    const compose = await db.performQuery(db.addQuestionsToForm(form_id.rows[0].form_uuid, question_uuids));
    res.status(200).send(`{"status": "Questions added to form"}`);
    
  } catch (err) {

    res.status(400).send(err);

  }
});


/**
 * first add the user id and the form id in the has_submit table, 
 * then insert a new answer for each answer given in the request
 * request body must be like:
 *  {"user_id": "",	"answers" : [{ "free_text": "", "question_id": ""},
							                                  {	"true_false": "(true/false)", "question_id": ""}, 
							                                  { "multiple_coice": "value1, ..., valueX", "free_text": "", "question_id": ""}
                                              ]}
 * the answers don't need to contein empy values for empty fields, but require the id of the question
 */
router.post('/:form_id/answer', async (req, res) => {
  let form_id = req.params.form_id
  let user_data;

  if (Object.keys(req.body).length) { 

    user_data = req.body;

  } else {

    user_data = req.query;

  }

  try {

    const has_submit = await db.performQuery(db.submitForm(user_data.user_id, form_id));
    const new_answers = await db.performQuery(db.createNewAnswer(user_data.answers, user_data.user_id, form_id));
    res.status(200).send('{"status": "form submitted"}')

  } catch (err) {

    res.status(400).send(err);

  }

});


module.exports = router;
