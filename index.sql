USE Digital_evaluation;
 
-- =========================
-- IDENTITY
-- =========================
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_active ON user_sessions(session_token_hash, is_active);
CREATE INDEX idx_user_sessions_active_last ON user_sessions(is_active, last_active_at);
CREATE INDEX idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);
 
-- =========================
-- ACADEMIC
-- =========================
CREATE INDEX idx_classes_year ON classes(academic_year);
CREATE INDEX idx_classes_grade_section_year ON classes(grade, section, academic_year);
 
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_active_deleted ON students(is_active, deleted_at);
 
CREATE INDEX idx_faculty_active_deleted ON faculty(is_active, deleted_at);
 
CREATE INDEX idx_fcsa_faculty_id ON faculty_class_subject_assignments(faculty_id);
CREATE INDEX idx_fcsa_class_id ON faculty_class_subject_assignments(class_id);
CREATE INDEX idx_fcsa_subject_id ON faculty_class_subject_assignments(subject_id);
 
CREATE INDEX idx_exam_schedules_class_subject ON exam_schedules(class_id, subject_id);
CREATE INDEX idx_exam_schedules_datetime ON exam_schedules(exam_datetime);
CREATE INDEX idx_exam_schedules_created_by ON exam_schedules(created_by_user_id);
 
-- =========================
-- SUBMISSIONS
-- =========================
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_exam_id ON submissions(exam_schedule_id);
CREATE INDEX idx_submissions_status ON submissions(status_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
 
CREATE INDEX idx_documents_submission_id ON documents(submission_id);
CREATE INDEX idx_files_document_id ON files(document_id);
CREATE INDEX idx_files_deleted ON files(is_deleted);
 
CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_current ON file_versions(is_current);
 
CREATE INDEX idx_pages_version_id ON pages(version_id);
 
-- =========================
-- EVALUATIONS
-- =========================
CREATE INDEX idx_evaluations_faculty_id ON evaluations(faculty_id);
CREATE INDEX idx_evaluations_status ON evaluations(status_id);
CREATE INDEX idx_evaluations_evaluated_at ON evaluations(evaluated_at);
CREATE INDEX idx_evaluations_faculty_status ON evaluations(faculty_id, status_id);
 
-- =========================
-- ANNOTATIONS
-- =========================
CREATE INDEX idx_annotations_evaluation_id ON annotations(evaluation_id);
CREATE INDEX idx_annotations_page_id ON annotations(page_id);
CREATE INDEX idx_annotations_faculty_id ON annotations(created_by_faculty_id);
CREATE INDEX idx_annotations_deleted_at ON annotations(deleted_at);
 
-- =========================
-- SYSTEM
-- =========================
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
 
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by_user_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
 