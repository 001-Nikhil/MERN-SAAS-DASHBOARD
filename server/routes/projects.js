const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, tenantGuard, restrictTo } = require('../middleware/auth');
const { projectValidator, validate } = require('../middleware/validate');

// All project routes require authentication + tenant context
router.use(protect, tenantGuard);

router.get('/stats', projectController.getProjectStats);
router.get('/', projectController.getProjects);
router.post('/', projectValidator, validate, projectController.createProject);
router.get('/:id', projectController.getProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', restrictTo('owner', 'admin'), projectController.deleteProject);

module.exports = router;