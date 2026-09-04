const express = require('express');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin-only module: every route requires an authenticated admin.
router.use(authenticateToken, requireAdmin);

const mapRow = (r) => ({
  id: r.id,
  activity: r.activity || '',
  implementingEntity: r.implementing_entity || '',
  deliveryPartner: r.delivery_partner || '',
  responsible: r.responsible || '',
  keyProjectActivity: r.key_project_activity || '',
  subActivityNo: r.sub_activity_no || '',
  subActivities: r.sub_activities || '',
  inputsResources: r.inputs_resources || '',
  taskNo: r.task_no || '',
  task: r.task || '',
  status: r.status || 'Not Yet Started',
  startDate: r.start_date || null,
  endDate: r.end_date || null,
  outputs: r.outputs || '',
  indicator: r.indicator || '',
  baseline: r.baseline || '',
  target: r.target || '',
  achieved: r.achieved || '',
  variance: r.variance || '',
  meansOfVerification: r.means_of_verification || '',
  deliveryPartnerResponsible: r.delivery_partner_responsible || '',
  comments: r.comments || '',
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const buildFields = (b) => ({
  activity: b.activity ?? null,
  implementing_entity: b.implementingEntity ?? null,
  delivery_partner: b.deliveryPartner ?? null,
  responsible: b.responsible ?? null,
  key_project_activity: b.keyProjectActivity ?? null,
  sub_activity_no: b.subActivityNo ?? null,
  sub_activities: b.subActivities ?? null,
  inputs_resources: b.inputsResources ?? null,
  task_no: b.taskNo ?? null,
  task: b.task ?? null,
  status: b.status || 'Not Yet Started',
  start_date: b.startDate || null,
  end_date: b.endDate || null,
  outputs: b.outputs ?? null,
  indicator: b.indicator ?? null,
  baseline: b.baseline ?? null,
  target: b.target ?? null,
  achieved: b.achieved ?? null,
  variance: b.variance ?? null,
  means_of_verification: b.meansOfVerification ?? null,
  delivery_partner_responsible: b.deliveryPartnerResponsible ?? null,
  comments: b.comments ?? null,
});

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.execute('SELECT * FROM me_activities ORDER BY created_at DESC');
    res.json(rows.map(mapRow));
  } catch (error) {
    console.error('Fetch M&E activities error:', error);
    res.status(500).json({ message: 'Failed to fetch M&E activities' });
  }
});

const insertRow = async (pool, body, userId) => {
  const f = buildFields(body);
  const id = body.id || crypto.randomUUID();
  const cols = ['id', ...Object.keys(f), 'created_by'];
  const values = [id, ...Object.values(f), userId];
  await pool.execute(
    `INSERT INTO me_activities (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
    values
  );
  const [rows] = await pool.execute('SELECT * FROM me_activities WHERE id = ?', [id]);
  return mapRow(rows[0]);
};

router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    res.status(201).json(await insertRow(pool, req.body, req.user.id));
  } catch (error) {
    console.error('Create M&E activity error:', error);
    res.status(500).json({ message: 'Failed to create M&E activity' });
  }
});

router.post('/bulk', async (req, res) => {
  const pool = req.app.locals.pool;
  const items = Array.isArray(req.body) ? req.body : req.body?.activities;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Expected an array of activities' });
  }
  const inserted = [];
  const errors = [];
  for (let i = 0; i < items.length; i++) {
    try {
      inserted.push(await insertRow(pool, items[i], req.user.id));
    } catch (e) {
      console.error('Bulk M&E activity row error:', e);
      errors.push({ row: i + 1, message: e.message });
    }
  }
  res.status(errors.length ? 207 : 201).json({ inserted, errors });
});

router.put('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const f = buildFields(req.body);
  const setClause = [...Object.keys(f).map((k) => `${k} = ?`), 'modified_by = ?'].join(', ');
  try {
    await pool.execute(
      `UPDATE me_activities SET ${setClause} WHERE id = ?`,
      [...Object.values(f), req.user.id, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM me_activities WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Record not found' });
    res.json(mapRow(rows[0]));
  } catch (error) {
    console.error('Update M&E activity error:', error);
    res.status(500).json({ message: 'Failed to update M&E activity' });
  }
});

router.delete('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.execute('DELETE FROM me_activities WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete M&E activity' });
  }
});

module.exports = router;
