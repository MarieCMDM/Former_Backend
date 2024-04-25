const express = require('express');
const router  = express.Router();
const db      = require('../database/query_builder.js');

/**
 * get all the questions in the database and parse them as a JSON 
 */ 
router.get('/', async (req, res, next) => {
  const {content, true_false, multiple_choice, free_text, owner} = req.query;

  try {

    const questions = await db.performQuery(db.getQuestions());
    let result      = questions.rows;
   
    // transform the string stored in db into a json 
    let json_multi = '{"choices":[';
    
    for(let i = 0; i < result.length; i++){

      if (result[i].multiple_choice != '') {

        const array = result[i].multiple_choice.split(",");
        for(let element of array) {

          json_multi += `{"value": "${element}"},`;

        }

        json_multi                = json_multi.slice(0, - 1);
        json_multi               += '] }'
        result[i].multiple_choice = JSON.parse(json_multi);
        json_multi                = '{"choices":[';
      }
    }
    
    if (content) {

      result = result.filter(r => r.content === content);

    }
    
    if (true_false) {

      if (true_false=='true') {

        result = result.filter(r => r.true_false === true);

      } else if (true_false=='false') {

        result = result.filter(r => r.true_false === false);

      }
    }
    
    if (multiple_choice) {

      result = result.filter(r => r.multiple_choice === multiple_choice);

    }
    
    if (free_text) {

      if (free_text=='true') {

        result = result.filter(r => r.free_text === true);

      } else if (free_text=='false') {

        result = result.filter(r => r.free_text === false);

      }
    }
    
    if (owner) {

      result = result.filter(r => r.owner === owner);

    }
      
    res.status(200).send(result);

  } catch (err) {

    res.status(400).send(err);

  }
});


/**
 * get the question with the given id
 */
router.get('/:question_id', async (req, res, next) => {
  const { question_id } = req.params;
  try {

    const questions = await db.performQuery(db.getQuestionById(question_id));
    res.status(200).send(questions.rows);

  } catch (err) {

    res.status(400).send(err);

  }
});


/**
 * add a new question to the database 
 * the request must be:
 * {"content": "", "true_false": (true/false), "multiple_choice": "value1, ..., valueX", "free_text": (true/false), "owner_id": ""}
 */
router.post('/new_question', async (req, res) => {
  let user_data;

  if (Object.keys(req.body).length) { 

    user_data = req.body;

  } else {

    user_data = req.query;

  }
  
  try {

    const add_question = await db.performQuery(db.addQuestion(user_data));
    res.status(200).send('{"status": "New question is added to the database"}');

  } catch (err) {

    res.status(400).send(err);

  }
});

module.exports = router;
