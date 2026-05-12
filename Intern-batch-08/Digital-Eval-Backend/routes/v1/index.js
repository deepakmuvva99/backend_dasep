const express = require('express');
const router = express.Router();

const usersRoutes = require('./users');
const subjectsRoutes = require('./subjects');
const studentsRoutes = require('./students');
const submissionsRoutes = require('./submissions');

const authRoutes = require('./auth');
const rolesRoutes = require('./roles');
const permissionsRoutes = require('./permissions');
const classesRoutes = require('./classes');
const facultyRoutes = require('./faculty');
const assignmentsRoutes = require('./assignments');

const examSchedulesRoutes = require('./exam-schedules');
const evaluationsRoutes = require('./evaluations');
const documentsRoutes = require('./documents');
const filesRoutes = require('./files');
const pagesRoutes = require('./pages');

const annotationsRoutes = require('./annotations');
const notificationsRoutes = require('./notifications');
const auditLogsRoutes = require('./audit-logs');

router.use('/users', usersRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/students', studentsRoutes);
router.use('/submissions', submissionsRoutes);

router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/classes', classesRoutes);
router.use('/faculty', facultyRoutes);
router.use('/assignments', assignmentsRoutes);

router.use('/exam-schedules', examSchedulesRoutes);
router.use('/evaluations', evaluationsRoutes);
router.use('/documents', documentsRoutes);
router.use('/files', filesRoutes);
router.use('/pages', pagesRoutes);

router.use('/annotations', annotationsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/audit-logs', auditLogsRoutes);

module.exports = router;
