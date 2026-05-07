const cron = require('node-cron');
const db = require('../config/database');
const notificationsService = require('./notificationsService');

class CronService {
    start() {
        console.log('⏳ Starting Cron Service for background tasks...');

        // Run every minute to check for expired exam deadlines
        cron.schedule('* * * * *', async () => {
            try {
                // Find all exams where the deadline has passed and no notification has been sent yet.
                // We check the notifications table to see if a deadline notification already exists
                // for this exam schedule, avoiding the need for a separate column on exam_schedules.
                const [expiredExams] = await db.execute(`
                    SELECT e.exam_schedule_id, e.class_id, e.subject_id, s.name as subject_name
                    FROM exam_schedules e
                    JOIN subjects s ON e.subject_id = s.subject_id
                    WHERE e.exam_datetime <= NOW() 
                      AND e.deleted_at IS NULL
                      AND NOT EXISTS (
                          SELECT 1 FROM notifications n 
                          WHERE n.entity_type = 'exam_deadline' 
                            AND n.entity_id = e.exam_schedule_id
                      )
                `);

                for (const exam of expiredExams) {
                    // Find assigned faculty for this class + subject
                    const [assignments] = await db.execute(
                        `SELECT f.user_id 
                         FROM faculty_class_subject_assignments a
                         JOIN faculty f ON a.faculty_id = f.faculty_id
                         WHERE a.class_id = ? AND a.subject_id = ? AND f.is_active = 1 AND f.deleted_at IS NULL AND a.deleted_at IS NULL`,
                        [exam.class_id, exam.subject_id],
                    );

                    // Notify each assigned faculty member
                    for (const assignment of assignments) {
                        await notificationsService.createNotification({
                            user_id: assignment.user_id,
                            entity_type: 'exam_deadline',
                            entity_id: exam.exam_schedule_id,
                            message: `The deadline for ${exam.subject_name} has passed. Please begin evaluating the submissions.`,
                        });
                    }

                    console.log(`✅ Deadline notification sent for exam_schedule_id: ${exam.exam_schedule_id}`);
                }
            } catch (error) {
                console.error('❌ Error in Cron Service checking expired exams:', error.message);
            }
        });
    }
}

module.exports = new CronService();
