const express = require('express');
const multer = require('multer');
const { pool } = require('../db');

const router = express.Router();

// Configure multer for file uploads; files will be stored in the uploads
// directory relative to the project root. Each file gets a unique name.
const upload = multer({ dest: 'uploads/' });

// Middleware para validação de entrada
function validateIssue(req, res, next) {
  const { title, description, category_id, lat, lng } = req.body;
  if (!title || !description || !category_id || !lat || !lng) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }
  next();
}

// Fetch a list of recent issues. This returns the most recent 200
// occurrences along with their category name and vote count.
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, c.name AS category_name,
        (SELECT COUNT(*) FROM votes v WHERE v.issue_id = i.id) AS votes
      FROM issues i
      LEFT JOIN categories c ON c.id = i.category_id
      ORDER BY i.created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar ocorrências.' });
  }
});

// Create a new issue. Accepts multipart/form-data with up to three
// uploaded images. The body should contain user_id, title,
// description, category_id, lat, lng and address (optional).
router.post('/', upload.array('photos', 3), validateIssue, async (req, res) => {
  try {
    const { user_id, title, description, category_id, lat, lng, address } = req.body;
    // Basic validation
    if (!user_id || !title || !description || !category_id || !lat || !lng) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }
    // Insert the issue
    const [result] = await pool.execute(
      'INSERT INTO issues (user_id, category_id, title, description, lat, lng, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, category_id, title, description, lat, lng, address]
    );
    const issueId = result.insertId;
    // Insert the uploaded photos into the photos table
    for (const file of req.files || []) {
      await pool.execute(
        'INSERT INTO photos (issue_id, url) VALUES (?, ?)',
        [issueId, `/uploads/${file.filename}`]
      );
    }
    res.status(201).json({ id: issueId, message: 'Ocorrência criada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar ocorrência.' });
  }
});

module.exports = router;