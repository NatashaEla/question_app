console.log('Скрипт запущен');
const express = require ('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;
const axios = require('axios');

app.use(express.json());

console.log('Скрипт запущен');

console.log('Настройка подключения к базе данных');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'question_app',
    password: '12345',
    port: 12345
});

app.get('/random_quote', async (req, res) => {
try {
    const response = await axios.get('https://nbvk-quotes-api.vercel.app/v2');
    const data = response.data;
    const result = {
        quote : data.quote_text,
        author : `${data.first_name} ${data.last_name}`
    };
    res.json(result);
} catch (err) {
    console.error('Ошибка получения случайной цитаты:', err);
    res.status(500).send('Ошибка получения случайной цитаты');
    }
});

app.get('/question', async (red, res)=> {
    try {
        const result = await pool.query('SELECT * FROM questions order by random() LIMIT 1');
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка получения вопроса', err);
        res.status(500).send('Ошибка получения вопроса');
    }
});

app.post('text_answer', async(req, res) => {
    const { device_id, question_id, answer} = req.body;
    try {
        await pool.query('INSERT INTO text_answers (device_id, question_id, answer) VALUES ($1, $2, $3)', [device_id, question_id, answer]);
        res.status(201).send('Ответ сохранен');
    } catch (err) {
        console.error('Ошибка сохранения ответа:', err);
        res.status(500).send('Ошибка сохранения ответа')
    }
});

app.post('color_answer', async(req, res) => {
    const { device_id, question_id, color} = req.body;
    try {
        await pool.query('INSERT INTO color_answers (device_id, question_id, color) VALUES ($1, $2, $3)', [device_id, question_id, answer]);
        res.status(201).send('Ответ сохранен');
    } catch (err) {
        console.error('Ошибка сохранения ответа:', err);
        res.status(500).send('Ошибка сохранения ответа')
    }
});

app.get('/history', async (req, res) => {
    const { start_date, end_date, type, device_id, question_id } = req.query;
    try {
        const result = await pool.query(`
        SELECT 'text' AS type, device_id, question_id, answer AS response, date
        FROM text_answers  
        WHERE date BETWEEN $1 AND $2
        UNION ALL 
        SELECT 'tcolor' AS type, device_id, question_id, color AS response, date
        FROM color_answers  
        WHERE date BETWEEN $1 AND $2
        ORDER BY date DESC
        `, [start_date, end_date]);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения истории ответов:', err);
        res.status(500).send('Ошибка получения ответов');
    }

});

app.listen(port, () => {
    console.log('Сервер работает на http://localhost:${port}')
});
