require('dotenv').config({path: '../.env'});

const pg     = require('pg');
const bcrypt = require("bcrypt");

const config = {
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 1000,  
  maxUses: 7500,
};

if (!config.user)
  throw new Error(`no DB_USER environment constiable specified`);

if (!config.database)
  throw new Error(`no DB_DATABASE environment constiable specified`);

if (!config.password)
  throw new Error(`no DB_PASSWORD environment constiable specified`);
              
const db = new pg.Pool(config);

db.query('SELECT 1').catch(err => {
  console.error('could not connect to database');
  process.exit(1);
});
  
/**
 * Perform the given query on the database
 * @param {String} query 
 * @returns Promise, result of query or error occured
 */
const performQuery = (query) => {
  return new Promise ((resolve, reject) => {
    try {
      const result = db.query(`${query}`);
      resolve(result);
    } catch (err) {
      reject(err)
    }
  })
};

/**
 * Generate the query for retrive the password for the user with the given email
 * @param {string} email 
 * @returns string
 */
const getPassword = (email) => {
  return `SELECT password FROM public.users WHERE email = '${email}'`; 
};

/**
 * Generate the query for check if the given email is on the database
 * @param {string} email 
 * @returns 
 */
const getEmail = (email) => {
  return `SELECT email FROM public.users WHERE email = '${email}'`; 
};

/**
 * Generate the query for retrive the list of all users 
 * @returns 
 */
const getUsers = () => {
  return `SELECT user_uuid, name, last_name, birth_date, gender, email FROM public.users ORDER by user_uuid ASC`;
}; 

/**
 * Generate the query for retrive infos about te user with the given id
 * @param {string} user_id 
 * @returns 
 */
const getUserById = (user_id) => {
  return `SELECT name, last_name, birth_date, gender, email FROM public.users WHERE user_uuid = '${user_id}'`;
}; 

/**
 * Generate the query for add a new user in the database 
 * it also hash the password 
 * the JSON must have the following structure:
 * {name: "", last_name: "", birth_date: "", gender: "", email: "", password: ""}
 * @param {JSON} user 
 * @returns 
 */
const addUser = async (user) => {
  const hash  = await bcrypt.hash(user.password, 10);
  return `INSERT INTO public.users (name, last_name, birth_date, gender, email, password)  
          VALUES ('${user.name}', '${user.last_name}', '${user.birth_date}', '${user.gender}', '${user.email}', '${hash}')`; 
};

/**
 * Generate the query for retrive all questions 
 * @returns 
 */
const getQuestions = () => {
  return `SELECT question_uuid, content, true_false, multiple_choice, free_text, name FROM public.questions
	        INNER JOIN public.users ON questions.owner_id = users.user_uuid`; 
};

/**
 * Generate the query for retrive the question with the given id
 * @param {string} user_id 
 * @returns 
 */
const getQuestionById = (user_id) => {
  return `SELECT question_uuid, content, true_false, multiple_choice, free_text, name FROM public.questions
	        INNER JOIN public.users ON questions.owner_id = users.user_uuid
          WHERE question_uuid = ${user_id}`; 
};

/**
 * Generate the query for add a new question in the database
 * the requied format for the question is the folowing
 * {"content": "", "true_false": (true/false), "multiple_choice": "value1, value2, ..., valueX", "free_text": (true/false), "owner_id": ""}
 * @param {JSON} question 
 * @returns 
 */
const addQuestion = (question) => {
  const content    = question.content;
  const true_false = (question.true_false == '' || question.true_false == 'false' || question.true_false === 'undefined') ? false : true;
  const multi      = (typeof question.multiple_choice === 'undefined') ? "" : question.multiple_choice;
  const free_text  = (question.free_text == '' || question.free_text == 'false' || typeof question.free_text === 'undefined') ? false : true;
  const owner_id   = (question.owner_id);
  const new_multi  = multi.replace(/\s/g, "");

  return `INSERT INTO public.questions (content, true_false, multiple_choice, free_text, owner_id)
          VALUES ('${content}', '${true_false}', '${new_multi}', '${free_text}', '${owner_id}')`;
};

/**
 * Generate the query for get the lastest form_id generated
 * @returns 
 */
const getNewestForm = () => {
  return `SELECT * FROM public.forms ORDER BY form_uuid DESC`;
};

/**
 * Generate the query for retrive all the forms
 * @returns 
 */
const getForms = () => {
  return `SELECT form_id, content, true_false, multiple_choice, free_text 
          FROM public.form_composition 
          LEFT JOIN public.questions ON form_composition.question_id = questions.question_uuid 
          ORDER BY form_id DESC`;
};

/**
 * Generate the query for retrive the form with the given id
 */
const getFormById = (form_id) => {
  return `SELECT form_id, question_uuid, content, true_false, multiple_choice, free_text 
          FROM public.form_composition 
	        LEFT JOIN public.questions ON form_composition.question_id = questions.question_uuid 
	        WHERE form_id = '${form_id}'`;
};

/**
 * Generate the query for retrive the list of forms submitted by a user
 * @param {string} user_id 
 * @returns 
 */
const getFormsSubmittedByUser = (user_id) => {
  return `SELECT form_id FROM public.has_submit 
          WHERE user_id = '${user_id}'
          ORDER BY form_id DESC`;
};

/**
 * Generate the query for generate a new form
 * @returns 
 */
const addForm = () => {
  return `INSERT INTO public.forms DEFAULT VALUES RETURNING form_uuid`;
};

/**
 * Generate the query for add the given list of questions tho the given form id
 * @param {string} form_id 
 * @param {string[]} question_ids 
 * @returns 
 */
const addQuestionsToForm = (form_id, question_ids) => {
  let values = ` `;
  for (const i = 0; i < question_ids.length; i++) {

    if (i == question_ids.length -1) {
      values += `('${form_id}', '${question_ids[i]}') `
    } else {
      values += `('${form_id}', '${question_ids[i]}'), `
    }
  }

  return `INSERT INTO public.form_composition (form_id, question_id)
          VALUES ${values}`;
};

/**
 * Generate the query for retrive the answers for the given form_id of the given user id
 * @param {string} form_id 
 * @param {string} user_id 
 * @returns 
 */
const getAnswers = (form_id, user_id) => {
  return `SELECT qst.content, anw.true_false, anw.multiple_choice, anw.free_text  FROM public.form_composition AS frm
          LEFT JOIN public.has_submit AS sbm ON sbm.form_id = frm.form_id
          LEFT JOIN public.questions AS qst ON frm.question_id =  qst.question_uuid
          LEFT JOIN public.answers AS anw ON anw.question_id = qst.question_uuid AND anw.form_id = frm.form_id
          WHERE sbm.user_id = '${user_id}' AND frm.form_id = '${form_id}'`;
};

/**
 * Generate the query for add the match for user id and form submitted 
 * @param {string} user_id 
 * @param {string} form_id 
 * @returns 
 */
const submitForm = (user_id, form_id) => {
  return `INSERT INTO public.has_submit (user_id, form_id)
          VALUES ('${user_id}', '${form_id}')`;
};

/**
 * Generate the query for add on the database the given answers for the given user and the given form
 * the requied format for the answers is the folowing:
 * {"free_text": "", "question_id": ""}
 * or
 * {"true_false": "(true/false)", "question_id": ""}
 * or
 * {"multiple_coice": "value1, ..., valueX", "free_text": "", "question_id": ""}
 * or a mix of theese
 *  
 * @param {JSON[]} answers 
 * @param {string} user_id 
 * @param {string} form_id 
 * @returns 
 */
const createNewAnswer = (answers, user_id, form_id) => {
  const values = ``;
  for (const i = 0; i < answers.length; i++) { 
    
    if (i == answers.length -1) {   
      values +=`(`; 
      values += (typeof answers[i].true_false === 'undefined' || answers[i].true_false == '') ? 'DEFAULT' + ', '  : `'${answers[i].true_false}', `;
      values += (typeof answers[i].multiple_choice === 'undefined' || answers[i].multiple_choice == '') ? 'DEFAULT' + ', ' : `'${answers[i].multiple_choice}', `;
      values += (typeof answers[i].free_text === 'undefined') ? 'DEFAULT' + ', ' : `'${answers[i].free_text}', `;
      values += `'${form_id}', '${answers[i].question_id}', '${user_id}') `;
    } else {
      values +=`(`; 
      values += (typeof answers[i].true_false === 'undefined' || answers[i].true_false == '') ? 'DEFAULT'  + ', ' : `'${answers[i].true_false}', `;
      values += (typeof answers[i].multiple_choice === 'undefined' || answers[i].multiple_choice == '') ? 'DEFAULT'  + ', ' : `'${answers[i].multiple_choice}', `;
      values += (typeof answers[i].free_text === 'undefined') ? 'DEFAULT'  + ', ': `'${answers[i].free_text}', `;
      values += `'${form_id}', '${answers[i].question_id}', '${user_id}'), `;
    }
  }
  
  return `INSERT INTO public.answers (true_false, multiple_choice, free_text, form_id, question_id, user_id) VALUES ${values}`;
};

module.exports = {performQuery, getPassword, getEmail, getUsers, getUserById, addUser, getQuestions, getQuestionById, addQuestion, 
                  getNewestForm, getForms, getFormById, addForm, addQuestionsToForm, getAnswers, submitForm, createNewAnswer, getFormsSubmittedByUser};

