CREATE DATABASE IF NOT EXISTS Digital_evaluation;

USE Digital_evaluation;
 show tables;
 select * from annotations;
 select * from users;
 select * from evaluations;
 INSERT INTO annotations (
    evaluation_id,
    page_id,
    annotation_type_id,
    pos_x,
    pos_y,
    pos_width,
    pos_height,
    position_data,
    content,
    created_by_faculty_id
) VALUES (
    501,          -- evaluation_id
    1201,         -- page_id
    1,            -- 1 = Highlight
    150,          -- X position
    320,          -- Y position
    200,          -- width of highlight box
    30,           -- height of highlight box
    JSON_OBJECT('color', 'yellow', 'opacity', 0.5),
    'Check this step again',
    10            -- faculty_id
);
-- ============================================================

-- TABLE: users

-- MODULE: identity

-- ============================================================
 
CREATE TABLE users (

    user_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique user identifier',

    name VARCHAR(255) NOT NULL COMMENT 'User full name',

    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address',

    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    INDEX idx_created_at (created_at),

    INDEX idx_active_users (deleted_at, user_id)
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='User accounts for the system';
 
-- ============================================================

-- TABLE: roles

-- MODULE: identity

-- ============================================================
 
CREATE TABLE roles (

    role_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique role identifier',

    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Role name (e.g., Admin, Teacher, Student)',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Role creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='System roles for authorization';
 
-- ============================================================

-- TABLE: permissions

-- MODULE: identity

-- ============================================================
 
CREATE TABLE permissions (

    permission_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique permission identifier',

    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Permission name (e.g., create_exam, view_marks)',

    description TEXT COMMENT 'Permission description',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Permission creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Granular permissions for access control';
 
 
-- ============================================================

-- TABLE: role_permissions

-- MODULE: identity

-- ============================================================
 
CREATE TABLE role_permissions (

    role_permission_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique role-permission mapping identifier',

    role_id INT NOT NULL COMMENT 'Reference to role',

    permission_id INT NOT NULL COMMENT 'Reference to permission',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Mapping creation timestamp',
 
    UNIQUE KEY unique_role_permission (role_id, permission_id),

    INDEX idx_permission_id (permission_id),
 
    CONSTRAINT fk_role_permissions_role_id

        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_role_permissions_permission_id

        FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Mapping between roles and their permissions';
 
-- ============================================================

-- TABLE: user_roles

-- MODULE: identity

-- ============================================================
 
CREATE TABLE user_roles (

    user_role_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique user-role mapping identifier',

    user_id INT NOT NULL COMMENT 'Reference to user',

    role_id INT NOT NULL COMMENT 'Reference to role',

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Role assignment timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp for role revocation',
 
    UNIQUE KEY unique_user_role (user_id, role_id),

    INDEX idx_role_id (role_id),

    INDEX idx_user_active (user_id, deleted_at),
 
    CONSTRAINT fk_user_roles_user_id

        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_user_roles_role_id

        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Mapping between users and their assigned roles';
 
-- ============================================================

-- TABLE: user_sessions

-- MODULE: identity

-- ============================================================
 
CREATE TABLE user_sessions (

    session_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique session identifier',

    user_id INT NOT NULL COMMENT 'Reference to user',

    session_token_hash VARCHAR(255) NOT NULL UNIQUE COMMENT 'Hashed session token for security',

    device_info JSON COMMENT 'Device information (browser, IP, etc.)',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Session creation timestamp',

    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last activity timestamp',

    is_active BOOLEAN DEFAULT TRUE COMMENT 'Session active status',
 
    INDEX idx_user_id (user_id),

    INDEX idx_last_active_at (last_active_at),

    INDEX idx_user_active (user_id, is_active),
 
    CONSTRAINT fk_user_sessions_user_id

        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Active user sessions for authentication';
 
-- ============================================================

-- TABLE: token_blacklist

-- MODULE: identity

-- ============================================================
 
CREATE TABLE token_blacklist (

    token_blacklist_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique blacklist entry identifier',

    jti VARCHAR(255) NOT NULL UNIQUE COMMENT 'JWT ID (jti claim)',

    user_id INT NOT NULL COMMENT 'Reference to user who was issued the token',

    expires_at TIMESTAMP NOT NULL COMMENT 'Token expiration timestamp',

    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when token was blacklisted',
 
    INDEX idx_user_id (user_id),

    INDEX idx_expires_at (expires_at),
 
    CONSTRAINT fk_token_blacklist_user_id

        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Blacklisted JWT tokens for logout/revocation';
 
-- ============================================================

-- TABLE: classes

-- MODULE: academic

-- ============================================================
 
CREATE TABLE classes (

    class_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique class identifier',

    grade INT NOT NULL COMMENT 'Grade level (e.g., 10, 11, 12)',

    section VARCHAR(50) NOT NULL COMMENT 'Section identifier (e.g., A, B, C)',

    academic_year INT NOT NULL COMMENT 'Academic year (e.g., 2024)',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Class creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    UNIQUE KEY unique_class_section_year (grade, section, academic_year),

    INDEX idx_academic_year (academic_year),

    INDEX idx_year_active (academic_year, deleted_at)
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='School classes/batches';
 
-- ============================================================

-- TABLE: subjects

-- MODULE: academic

-- ============================================================
 
CREATE TABLE subjects (

    subject_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique subject identifier',

    name VARCHAR(255) NOT NULL COMMENT 'Subject name (e.g., Mathematics, English)',

    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Subject code (e.g., MATH01)',

    description TEXT COMMENT 'Subject description',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Subject creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    INDEX idx_name (name)
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Subject/course definitions';
 
-- ============================================================

-- TABLE: class_subjects

-- MODULE: academic

-- ============================================================
 
CREATE TABLE class_subjects (

    class_subject_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique class-subject mapping identifier',

    class_id INT NOT NULL COMMENT 'Reference to class',

    subject_id INT NOT NULL COMMENT 'Reference to subject',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Mapping creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    UNIQUE KEY unique_class_subject (class_id, subject_id),

    INDEX idx_subject_id (subject_id),
 
    CONSTRAINT fk_class_subjects_class_id

        FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_class_subjects_subject_id

        FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Mapping between classes and their subjects';
 
-- ============================================================

-- TABLE: students

-- MODULE: academic

-- ============================================================
 
CREATE TABLE students (

    student_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique student identifier',

    user_id INT NOT NULL UNIQUE COMMENT 'Reference to user account',

    institution_id VARCHAR(50) NOT NULL COMMENT 'Institution/Roll number',

    class_id INT NOT NULL COMMENT 'Reference to class',

    is_active BOOLEAN DEFAULT TRUE COMMENT 'Student active status',

    created_by_user_id INT NOT NULL COMMENT 'Reference to user who created this record',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Student record creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    UNIQUE KEY unique_institution_id (institution_id),

    INDEX idx_class_id (class_id),

    INDEX idx_class_active (class_id, is_active, deleted_at),
 
    CONSTRAINT fk_students_user_id

        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_students_class_id

        FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_students_created_by_user_id

        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Student records';
 
-- ============================================================

-- TABLE: faculty

-- MODULE: academic

-- ============================================================
 
CREATE TABLE faculty (

    faculty_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique faculty identifier',

    user_id INT NOT NULL UNIQUE COMMENT 'Reference to user account',

    department VARCHAR(100) COMMENT 'Faculty department',

    is_active BOOLEAN DEFAULT TRUE COMMENT 'Faculty active status',

    credentials_sent_at TIMESTAMP NULL COMMENT 'When credentials were sent to faculty',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Faculty record creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    INDEX idx_department (department),

    INDEX idx_dept_active (department, is_active, deleted_at),
 
    CONSTRAINT fk_faculty_user_id

        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Faculty/teacher records';
 
-- ============================================================

-- TABLE: faculty_class_subject_assignments

-- MODULE: academic

-- ============================================================
 
CREATE TABLE faculty_class_subject_assignments (

    assignment_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique assignment identifier',

    faculty_id INT NOT NULL COMMENT 'Reference to faculty',

    subject_id INT NOT NULL COMMENT 'Reference to subject',

    class_id INT NOT NULL COMMENT 'Reference to class',

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Assignment date',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Assignment creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    UNIQUE KEY unique_faculty_subject_class (faculty_id, subject_id, class_id),

    INDEX idx_subject_id (subject_id),

    INDEX idx_class_id (class_id),

    INDEX idx_class_subject (class_id, subject_id, deleted_at),
 
    CONSTRAINT fk_fcsa_faculty_id

        FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_fcsa_subject_id

        FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_fcsa_class_id

        FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE RESTRICT ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Faculty assignments to teach specific subjects in specific classes';
 
-- ============================================================

-- TABLE: exam_schedules

-- MODULE: academic

-- ============================================================
 
CREATE TABLE exam_schedules (

    exam_schedule_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique exam schedule identifier',

    created_by_user_id INT NOT NULL COMMENT 'Reference to user who created the schedule',

    class_id INT NOT NULL COMMENT 'Reference to class',

    subject_id INT NOT NULL COMMENT 'Reference to subject',

    exam_datetime DATETIME NOT NULL COMMENT 'Scheduled exam date and time',

    title VARCHAR(255) NOT NULL COMMENT 'Exam title/name',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Schedule creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    INDEX idx_class_id (class_id),

    INDEX idx_subject_id (subject_id),

    INDEX idx_exam_datetime (exam_datetime),

    INDEX idx_created_by_user_id (created_by_user_id),

    INDEX idx_class_subject_date (class_id, subject_id, exam_datetime),
 
    CONSTRAINT fk_exam_schedules_created_by_user_id

        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_exam_schedules_class_id

        FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_exam_schedules_subject_id

        FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE RESTRICT ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Exam schedules';
 
-- ============================================================

-- TABLE: submission_types

-- MODULE: submissions

-- ============================================================
 
CREATE TABLE submission_types (

    submission_type_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique submission type identifier',

    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Submission type name',

    description TEXT COMMENT 'Submission type description',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Type creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Types of submissions';
 
-- ============================================================

-- TABLE: submission_status

-- MODULE: submissions

-- ============================================================
 
CREATE TABLE submission_status (

    submission_status_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique status identifier',

    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Status name (e.g., Pending, Under Review, Evaluated)',

    description TEXT COMMENT 'Status description',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Status creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Status of submissions';
 
-- ============================================================

-- TABLE: file_types

-- MODULE: submissions

-- ============================================================
 
CREATE TABLE file_types (

    file_type_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique file type identifier',

    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'File type name (e.g., PDF, JPG, PNG)',

    description TEXT COMMENT 'File type description',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Type creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='File types';
 
-- ============================================================

-- TABLE: submissions

-- MODULE: submissions

-- BIGINT PKs/FKs: high-volume table — expected to grow past INT ceiling

-- ============================================================
 
CREATE TABLE submissions (

    submission_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique submission identifier',

    student_id INT NOT NULL COMMENT 'Reference to student',

    exam_schedule_id INT NOT NULL COMMENT 'Reference to exam schedule',

    submission_type_id INT NOT NULL COMMENT 'Reference to submission type',

    status_id INT NOT NULL COMMENT 'Reference to submission status',

    submitted_at DATETIME NOT NULL COMMENT 'Submission date and time',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    -- [FIX] Added idx_exam_status for "all ungraded submissions for exam Y" —

    --       a core teacher workflow missing from v1

    INDEX idx_student_exam (student_id, exam_schedule_id),

    INDEX idx_exam_schedule_id (exam_schedule_id),

    INDEX idx_submitted_at (submitted_at),

    INDEX idx_status_submitted (status_id, submitted_at),

    INDEX idx_exam_status (exam_schedule_id, status_id),    -- NEW: teacher grading dashboard
 
    CONSTRAINT fk_submissions_student_id

        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_submissions_exam_schedule_id

        FOREIGN KEY (exam_schedule_id) REFERENCES exam_schedules(exam_schedule_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_submissions_submission_type_id

        FOREIGN KEY (submission_type_id) REFERENCES submission_types(submission_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_submissions_status_id

        FOREIGN KEY (status_id) REFERENCES submission_status(submission_status_id) ON DELETE RESTRICT ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Student submissions';
 
-- ============================================================

-- TABLE: documents

-- MODULE: submissions

-- ============================================================
 
CREATE TABLE documents (

    document_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique document identifier',

    submission_id BIGINT NOT NULL COMMENT 'Reference to submission',

    title VARCHAR(255) NOT NULL COMMENT 'Document title',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Document creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    INDEX idx_submission_id (submission_id),
 
    CONSTRAINT fk_documents_submission_id

        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Documents within submissions';

-- ============================================================

-- TABLE: files

-- MODULE: submissions

-- ============================================================
 
CREATE TABLE files (

    file_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique file identifier',

    document_id BIGINT NOT NULL COMMENT 'Reference to document',

    original_file_name VARCHAR(255) NOT NULL COMMENT 'Original uploaded file name',

    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME type (e.g., application/pdf)',

    file_size_kb INT NOT NULL COMMENT 'File size in kilobytes',

    file_type_id INT NOT NULL COMMENT 'Reference to file type',

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',

    is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'File record creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
 
    INDEX idx_document_id (document_id),

    INDEX idx_file_type_id (file_type_id),

    INDEX idx_document_uploaded (document_id, uploaded_at),  -- NEW: replaces standalone uploaded_at
 
    CONSTRAINT fk_files_document_id

        FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_files_file_type_id

        FOREIGN KEY (file_type_id) REFERENCES file_types(file_type_id) ON DELETE RESTRICT ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Files within documents';
 
-- ============================================================

-- TABLE: file_versions

-- MODULE: submissions

-- ============================================================
 
CREATE TABLE file_versions (

    version_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique file version identifier',

    file_id BIGINT NOT NULL COMMENT 'Reference to file',

    version_number INT NOT NULL COMMENT 'Version number (1, 2, 3...)',

    blob_name VARCHAR(255) NOT NULL COMMENT 'Blob storage object name',

    container_name VARCHAR(255) NOT NULL COMMENT 'Blob container name',

    -- blob_url removed: construct at app layer as

    --   {storage_base_url}/{container_name}/{blob_name}

    etag VARCHAR(255) COMMENT 'Entity tag for blob versioning',

    -- is_current removed: use files.current_version_id instead

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Version creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    UNIQUE KEY unique_file_version (file_id, version_number),
 
    INDEX idx_blob_name (blob_name),
 
    CONSTRAINT chk_version_number_positive

        CHECK (version_number > 0),              -- [CHECK] no zero or negative version numbers
 
    CONSTRAINT fk_file_versions_file_id

        FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='File versions for blob storage';
 
 
-- ============================================================

-- Backfill current_version_id on files after file_versions exists

-- [FIX] Atomic "current version" tracking: one FK update vs the

--       old two-step is_current Boolean flip that could go

--       inconsistent on failure.

--

-- Usage:

--   -- When uploading version N:

--   INSERT INTO file_versions (...) VALUES (...);

--   UPDATE files SET current_version_id = LAST_INSERT_ID()

--   WHERE file_id = ?;

--   -- Both in one transaction — atomic, no race condition.

-- ============================================================
 
ALTER TABLE files

    ADD COLUMN current_version_id BIGINT NULL

        COMMENT 'FK to the current (latest) file version — updated atomically on each new upload',

    ADD CONSTRAINT fk_files_current_version_id

        FOREIGN KEY (current_version_id) REFERENCES file_versions(version_id)

        ON DELETE SET NULL ON UPDATE CASCADE;
 
 
-- ============================================================

-- TABLE: pages

-- MODULE: submissions

-- ============================================================
 
CREATE TABLE pages (

    page_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique page identifier',

    version_id BIGINT NOT NULL COMMENT 'Reference to file version',

    page_number INT NOT NULL COMMENT 'Page number within the document',

    width INT COMMENT 'Page width in pixels',

    height INT COMMENT 'Page height in pixels',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Page creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    UNIQUE KEY unique_version_page_number (version_id, page_number),
 
    CONSTRAINT chk_page_width_positive

        CHECK (width IS NULL OR width > 0),      -- [CHECK] NULL allowed (not yet measured), but never 0 or negative

    CONSTRAINT chk_page_height_positive

        CHECK (height IS NULL OR height > 0),
 
    CONSTRAINT fk_pages_version_id

        FOREIGN KEY (version_id) REFERENCES file_versions(version_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Individual pages from scanned answer sheets';
 
-- ============================================================

-- TABLE: evaluation_status

-- MODULE: evaluation

-- ============================================================
 
CREATE TABLE evaluation_status (

    evaluation_status_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique status identifier',

    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Status name (e.g., Pending, In Progress, Completed)',

    description TEXT COMMENT 'Status description',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Status creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Status of evaluations';
 
-- ============================================================

-- TABLE: annotation_types

-- MODULE: evaluation

-- ============================================================
 
CREATE TABLE annotation_types (

    annotation_type_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique annotation type identifier',

    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Annotation type name',

    description TEXT COMMENT 'Annotation type description',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Type creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Types of annotations on answer sheets';
 
-- ============================================================

-- TABLE: evaluations

-- MODULE: evaluation

-- ============================================================
 
CREATE TABLE evaluations (

    evaluation_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique evaluation identifier',

    submission_id BIGINT NOT NULL COMMENT 'Reference to submission being evaluated',

    faculty_id INT NOT NULL COMMENT 'Reference to faculty doing evaluation',

    marks_awarded INT NOT NULL COMMENT 'Marks awarded by faculty',

    max_marks INT NOT NULL COMMENT 'Maximum possible marks',

    remarks TEXT COMMENT 'Evaluation remarks/feedback',

    status_id INT NOT NULL COMMENT 'Reference to evaluation status',

    evaluated_at DATETIME NOT NULL COMMENT 'Evaluation completion timestamp',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    UNIQUE KEY unique_submission_evaluation (submission_id, faculty_id),
 
    INDEX idx_faculty_id (faculty_id),

    INDEX idx_evaluated_at (evaluated_at),

    INDEX idx_faculty_status (faculty_id, status_id),
 
    CONSTRAINT chk_marks_non_negative

        CHECK (marks_awarded >= 0),              -- [CHECK] no negative marks

    CONSTRAINT chk_marks_within_max

        CHECK (marks_awarded <= max_marks),      -- [CHECK] cannot exceed maximum

    CONSTRAINT chk_max_marks_positive

        CHECK (max_marks > 0),                   -- [CHECK] max must be a real value
 
    CONSTRAINT fk_evaluations_submission_id

        FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_evaluations_faculty_id

        FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_evaluations_status_id

        FOREIGN KEY (status_id) REFERENCES evaluation_status(evaluation_status_id) ON DELETE RESTRICT ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Evaluations of student submissions';
 
-- ============================================================

-- TABLE: annotations

-- MODULE: evaluation

-- BIGINT PKs/FKs: high-volume (many annotations per evaluation)

-- ============================================================
 
CREATE TABLE annotations (

    annotation_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique annotation identifier',

    evaluation_id BIGINT NOT NULL COMMENT 'Reference to evaluation',

    page_id BIGINT NOT NULL COMMENT 'Reference to page being annotated',

    annotation_type_id INT NOT NULL COMMENT 'Reference to annotation type',
 
    -- [FIX] Extracted spatial fields for queryability

    pos_x INT NOT NULL COMMENT 'Annotation X coordinate (pixels from left)',

    pos_y INT NOT NULL COMMENT 'Annotation Y coordinate (pixels from top)',

    pos_width INT NOT NULL COMMENT 'Annotation bounding box width (pixels)',

    pos_height INT NOT NULL COMMENT 'Annotation bounding box height (pixels)',
 
    -- Retained for renderer-specific metadata (color, rotation, opacity, etc.)

    position_data JSON COMMENT 'Extra renderer metadata not needed for spatial queries',
 
    content TEXT COMMENT 'Annotation content (text, feedback, etc.)',

    created_by_faculty_id INT NOT NULL COMMENT 'Reference to faculty who created the annotation',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Annotation creation timestamp',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
 
    -- Generated columns for functional indexing on spatial fields

    -- Useful for "find all annotations with x between A and B"

    gen_pos_x INT GENERATED ALWAYS AS (pos_x) STORED COMMENT 'Generated column for pos_x index',

    gen_pos_y INT GENERATED ALWAYS AS (pos_y) STORED COMMENT 'Generated column for pos_y index',
 
    INDEX idx_evaluation_page (evaluation_id, page_id),

    INDEX idx_page_id (page_id),

    INDEX idx_created_by_faculty_id (created_by_faculty_id),

    INDEX idx_annotation_pos_x (gen_pos_x),    -- spatial: filter by X range on a page

    INDEX idx_annotation_pos_y (gen_pos_y),    -- spatial: filter by Y range on a page
 
    CONSTRAINT chk_pos_x_non_negative CHECK (pos_x >= 0),

    CONSTRAINT chk_pos_y_non_negative CHECK (pos_y >= 0),

    CONSTRAINT chk_pos_width_positive CHECK (pos_width > 0),

    CONSTRAINT chk_pos_height_positive CHECK (pos_height > 0),
 
    CONSTRAINT fk_annotations_evaluation_id

        FOREIGN KEY (evaluation_id) REFERENCES evaluations(evaluation_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_annotations_page_id

        FOREIGN KEY (page_id) REFERENCES pages(page_id) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_annotations_annotation_type_id

        FOREIGN KEY (annotation_type_id) REFERENCES annotation_types(annotation_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_annotations_created_by_faculty_id

        FOREIGN KEY (created_by_faculty_id) REFERENCES faculty(faculty_id) ON DELETE RESTRICT ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Annotations on answer sheet pages during evaluation';
 
-- ============================================================

-- TABLE: audit_logs

-- MODULE: system

-- BIGINT PKs: audit tables grow unbounded — INT ceiling is a

--             real risk over a multi-year deployment

--

-- [FIX] Extended partitions to p2027 + p2028.

--       A yearly MySQL EVENT (below) auto-adds the next

--       year's partition each January so pmax never becomes

--       a dumping ground and partition pruning stays effective.

--

-- NOTE: No FK on changed_by_user_id — partitioned tables in

--       MySQL cannot have foreign keys. Enforce referential

--       integrity at the application layer.

-- ============================================================
 
CREATE TABLE audit_logs (

    audit_log_id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Unique audit log identifier',

    entity_type VARCHAR(100) NOT NULL COMMENT 'Entity type changed (e.g., submissions, evaluations)',

    entity_id BIGINT NOT NULL COMMENT 'ID of the entity that was changed',

    field_name VARCHAR(100) COMMENT 'Field name that was changed',

    old_value LONGTEXT COMMENT 'Previous value',

    new_value LONGTEXT COMMENT 'New value',

    changed_by_user_id INT NOT NULL COMMENT 'Reference to user who made the change',

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Change timestamp',
 
    PRIMARY KEY (audit_log_id, changed_at),
 
    INDEX idx_entity_type_id (entity_type, entity_id),

    INDEX idx_changed_by_user_id (changed_by_user_id),

    INDEX idx_changed_at (changed_at)
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='Audit trail of all data changes'

PARTITION BY RANGE (UNIX_TIMESTAMP(changed_at)) (

    PARTITION p2024 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01 00:00:00')),

    PARTITION p2025 VALUES LESS THAN (UNIX_TIMESTAMP('2026-01-01 00:00:00')),

    PARTITION p2026 VALUES LESS THAN (UNIX_TIMESTAMP('2027-01-01 00:00:00')),

    PARTITION p2027 VALUES LESS THAN (UNIX_TIMESTAMP('2028-01-01 00:00:00')),  -- NEW

    PARTITION p2028 VALUES LESS THAN (UNIX_TIMESTAMP('2029-01-01 00:00:00')),  -- NEW

    PARTITION pmax  VALUES LESS THAN MAXVALUE

);
 
-- ============================================================

-- EVENT: auto_add_audit_partition

-- Runs every January 1st to add the next year's partition,

-- keeping pmax as just an emergency catch-all rather than

-- an active bucket. This prevents partition pruning from

-- degrading as years roll over.

--

-- Enable the event scheduler (add to my.cnf or run once):

--   SET GLOBAL event_scheduler = ON;

-- ============================================================
 
DELIMITER $$
 
CREATE EVENT IF NOT EXISTS auto_add_audit_partition

ON SCHEDULE EVERY 1 YEAR

STARTS '2026-01-01 00:01:00'          -- first run adds p2029 on Jan 1 2026

DO

BEGIN

    -- Determine the year two years ahead (safe buffer — adds year+2 partition)

    SET @next_year   = YEAR(NOW()) + 1;

    SET @next2_year  = YEAR(NOW()) + 2;

    SET @part_name   = CONCAT('p', @next2_year);

    SET @cutoff_ts   = UNIX_TIMESTAMP(CONCAT(@next2_year + 1, '-01-01 00:00:00'));
 
    -- Only add if partition doesn't already exist

    IF NOT EXISTS (

        SELECT 1

        FROM information_schema.PARTITIONS

        WHERE TABLE_SCHEMA = DATABASE()

          AND TABLE_NAME = 'audit_logs'

          AND PARTITION_NAME = @part_name

    ) THEN

        SET @sql = CONCAT(

            'ALTER TABLE audit_logs REORGANIZE PARTITION pmax INTO (',

            'PARTITION ', @part_name, ' VALUES LESS THAN (', @cutoff_ts, '),',

            'PARTITION pmax VALUES LESS THAN MAXVALUE)'

        );

        PREPARE stmt FROM @sql;

        EXECUTE stmt;

        DEALLOCATE PREPARE stmt;

    END IF;

END$$
 
DELIMITER ;

-- ============================================================

-- TABLE: notifications

-- MODULE: system

-- [FIX] Replaced idx_user_is_read (user_id, is_read) with the

--       three-column composite idx_user_unread_time

--       (user_id, is_read, sent_at).

--

--       The v1 index handled "unread notifications for user X"

--       but as a user accumulates thousands of notifications,

--       queries with a sent_at cutoff (e.g. last 30 days) had

--       to scan all unread rows for that user. The new index

--       lets MySQL satisfy:

--         WHERE user_id = X AND is_read = 0

--           AND sent_at > NOW() - INTERVAL 30 DAY

--       with a pure index range scan — no row reads needed

--       until the LIMIT is hit. This is the dominant query

--       pattern for notification bell / badge count endpoints.

-- ============================================================
 
CREATE TABLE notifications (

    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique notification identifier',

    user_id INT NOT NULL COMMENT 'Reference to user who receives notification',

    entity_type VARCHAR(100) NOT NULL COMMENT 'Entity type that triggered notification',

    entity_id BIGINT NOT NULL COMMENT 'ID of the entity that triggered notification',

    message TEXT NOT NULL COMMENT 'Notification message',

    is_read BOOLEAN DEFAULT FALSE COMMENT 'Whether user has read the notification',

    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Notification sent timestamp',

    read_at TIMESTAMP NULL COMMENT 'Timestamp when notification was read',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
 
    -- [FIX] Three-column composite replaces two-column idx_user_is_read.

    --       Covers: unread count, time-bounded unread list, full history.

    INDEX idx_user_unread_time (user_id, is_read, sent_at),  -- NEW: replaces idx_user_is_read

    INDEX idx_sent_at (sent_at),

    INDEX idx_entity_type_id (entity_type, entity_id),
 
    CONSTRAINT fk_notifications_user_id

        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

COMMENT='User notifications';
 
 
USE Digital_evaluation;
 
-- ============================================================

-- ROLES

-- ============================================================

INSERT INTO roles (name) VALUES

('Admin'),

('Teacher'),

('Student');
 
-- ============================================================

-- PERMISSIONS

-- ============================================================

INSERT INTO permissions (name, description) VALUES

('create_exam', 'Can create exams'),

('view_marks', 'Can view marks'),

('evaluate_submission', 'Can evaluate submissions'),

('submit_exam', 'Can submit exam');
 
-- ============================================================

-- ROLE PERMISSIONS

-- ============================================================

INSERT INTO role_permissions (role_id, permission_id) VALUES

(1,1),

(1,2),

(1,3),

(1,4),

(2,2),

(2,3),

(3,2),

(3,4);
 
-- ============================================================

-- USERS (password = 1234)

-- ============================================================

INSERT INTO users (name, email, password_hash) VALUES

('System Admin', 'admin@school.com', '$2b$10$R9h6N6VQj7l1sF1QmK1JQeJfJzL7jRkJ4fYgY5nAqZ6QmD7Tz2WQK'),

('John Teacher', 'teacher1@school.com', '$2b$10$R9h6N6VQj7l1sF1QmK1JQeJfJzL7jRkJ4fYgY5nAqZ6QmD7Tz2WQK'),

('Mary Teacher', 'teacher2@school.com', '$2b$10$R9h6N6VQj7l1sF1QmK1JQeJfJzL7jRkJ4fYgY5nAqZ6QmD7Tz2WQK'),

('Alice Student', 'student1@school.com', '$2b$10$R9h6N6VQj7l1sF1QmK1JQeJfJzL7jRkJ4fYgY5nAqZ6QmD7Tz2WQK'),

('Bob Student', 'student2@school.com', '$2b$10$R9h6N6VQj7l1sF1QmK1JQeJfJzL7jRkJ4fYgY5nAqZ6QmD7Tz2WQK');
 
-- ============================================================

-- USER ROLES

-- ============================================================

INSERT INTO user_roles (user_id, role_id) VALUES

(1,1),

(2,2),

(3,2),

(4,3),

(5,3);
 
-- ============================================================

-- CLASSES

-- ============================================================

INSERT INTO classes (grade, section, academic_year) VALUES

(10,'A',2026),

(10,'B',2026),

(11,'A',2026);
 
-- ============================================================

-- SUBJECTS

-- ============================================================

INSERT INTO subjects (name, code, description) VALUES

('Mathematics', 'MATH01', 'Math subject'),

('Science', 'SCI01', 'Science subject'),

('English', 'ENG01', 'English subject');
 
-- ============================================================

-- CLASS SUBJECTS

-- ============================================================

INSERT INTO class_subjects (class_id, subject_id) VALUES

(1,1),

(1,2),

(1,3),

(2,1),

(2,2),

(3,1),

(3,3);
 
-- ============================================================

-- FACULTY

-- ============================================================

INSERT INTO faculty (user_id, department) VALUES

(2,'Mathematics'),

(3,'Science');
 
-- ============================================================

-- STUDENTS

-- ============================================================

INSERT INTO students (user_id, institution_id, class_id, created_by_user_id) VALUES

(4,'STU001',1,1),

(5,'STU002',1,1);
 
-- ============================================================

-- FACULTY ASSIGNMENTS

-- ============================================================

INSERT INTO faculty_class_subject_assignments (faculty_id, subject_id, class_id) VALUES

(1,1,1),

(2,2,1);
 
-- ============================================================

-- EXAM SCHEDULES

-- ============================================================

INSERT INTO exam_schedules (created_by_user_id, class_id, subject_id, exam_datetime, title) VALUES

(1,1,1,'2026-05-01 09:00:00','Mathematics Midterm'),

(1,1,2,'2026-05-02 10:00:00','Science Midterm');
 
-- ============================================================

-- SUBMISSION TYPES

-- ============================================================

INSERT INTO submission_types (name, description) VALUES

('Online Upload','Student uploads answer sheet'),

('Offline Scan','Scanned by admin');
 
-- ============================================================

-- SUBMISSION STATUS

-- ============================================================

INSERT INTO submission_status (name, description) VALUES

('Pending','Waiting for submission'),

('Submitted','Submitted by student'),

('Under Review','Under evaluation'),

('Evaluated','Evaluation completed');
 
-- ============================================================

-- FILE TYPES

-- ============================================================

INSERT INTO file_types (name, description) VALUES

('PDF','Portable Document Format'),

('JPG','Image File'),

('PNG','Image File');
 
-- ============================================================

-- EVALUATION STATUS

-- ============================================================

INSERT INTO evaluation_status (name, description) VALUES

('Pending','Waiting'),

('In Progress','Ongoing'),

('Completed','Done');
 
-- ============================================================

-- ANNOTATION TYPES

-- ============================================================

INSERT INTO annotation_types (name, description) VALUES

('Text Comment','Written feedback'),

('Highlight','Highlighted area'),

('Mark','Tick/Cross');
 
 
 USE Digital_evaluation;
 
-- ============================================================

-- STEP 1: Users

-- ============================================================

INSERT INTO users (name, email, password_hash) VALUES

('Alice Johnson', CONCAT('alice_', UNIX_TIMESTAMP(), '@school.com'), SHA2(CONCAT('pass_', RAND()), 256)),

('Bob Smith',    CONCAT('bob_',   UNIX_TIMESTAMP(), '@school.com'), SHA2(CONCAT('pass_', RAND()), 256));
 
SET @user_student_id = LAST_INSERT_ID();

SET @user_faculty_id = @user_student_id - 1;
 
-- ============================================================

-- STEP 2: Roles

-- ============================================================

INSERT IGNORE INTO roles (name) VALUES ('Teacher'), ('Student');
 
SET @role_teacher_id = (SELECT role_id FROM roles WHERE name = 'Teacher');

SET @role_student_id = (SELECT role_id FROM roles WHERE name = 'Student');
 
-- ============================================================

-- STEP 3: Assign Roles to New Users

-- ============================================================

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES

(@user_faculty_id, @role_teacher_id),

(@user_student_id, @role_student_id);
 
-- ============================================================

-- STEP 4: Class

-- ============================================================

INSERT IGNORE INTO classes (grade, section, academic_year)

VALUES (11, 'A', YEAR(NOW()));
 
SET @class_id = (SELECT class_id FROM classes WHERE grade=11 AND section='A' AND academic_year=YEAR(NOW()) LIMIT 1);
 
-- ============================================================

-- STEP 5: Subject

-- ============================================================

INSERT IGNORE INTO subjects (name, code) VALUES ('Physics', 'PHY01');

SET @subject_id = (SELECT subject_id FROM subjects WHERE code='PHY01');
 
-- ============================================================

-- STEP 6: Class Subject Mapping

-- ============================================================

INSERT IGNORE INTO class_subjects (class_id, subject_id) VALUES (@class_id, @subject_id);
 
-- ============================================================

-- STEP 7: Faculty Record

-- ============================================================

INSERT IGNORE INTO faculty (user_id, department) VALUES (@user_faculty_id, 'Physics');

SET @faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = @user_faculty_id);
 
-- ============================================================

-- STEP 8: Student Record

-- ============================================================

INSERT IGNORE INTO students (user_id, institution_id, class_id, created_by_user_id)

VALUES (@user_student_id, CONCAT('S', UNIX_TIMESTAMP()), @class_id, @user_faculty_id);

SET @student_id = (SELECT student_id FROM students WHERE user_id = @user_student_id);
 
-- ============================================================

-- STEP 9: Faculty Class-Subject Assignment

-- ============================================================

INSERT IGNORE INTO faculty_class_subject_assignments (faculty_id, subject_id, class_id)

VALUES (@faculty_id, @subject_id, @class_id);
 
-- ============================================================

-- STEP 10: Exam Schedule

-- ============================================================

INSERT INTO exam_schedules (created_by_user_id, class_id, subject_id, exam_datetime, title)

VALUES (

    @user_faculty_id, @class_id, @subject_id,

    DATE_ADD(NOW(), INTERVAL 7 DAY),

    CONCAT('Physics Exam - ', DATE_FORMAT(NOW(), '%b %Y'))

);

SET @exam_schedule_id = LAST_INSERT_ID();
 
-- ============================================================

-- STEP 11: Submission Types, Status, File Types

-- ============================================================

INSERT IGNORE INTO submission_types (name) VALUES ('Exam');

INSERT IGNORE INTO submission_status (name) VALUES ('Submitted');

INSERT IGNORE INTO file_types (name) VALUES ('PDF');
 
SET @submission_type_id   = (SELECT submission_type_id   FROM submission_types  WHERE name = 'Exam');

SET @submission_status_id = (SELECT submission_status_id FROM submission_status WHERE name = 'Submitted');

SET @file_type_id         = (SELECT file_type_id         FROM file_types        WHERE name = 'PDF');
 
-- ============================================================

-- STEP 12: Submission

-- ============================================================

INSERT INTO submissions (student_id, exam_schedule_id, submission_type_id, status_id, submitted_at)

VALUES (@student_id, @exam_schedule_id, @submission_type_id, @submission_status_id, NOW());

SET @submission_id = LAST_INSERT_ID();
 
-- ============================================================

-- STEP 13: Document

-- ============================================================

INSERT INTO documents (submission_id, title)

VALUES (@submission_id, CONCAT('Answer Sheet - ', DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')));

SET @document_id = LAST_INSERT_ID();
 
-- ============================================================

-- STEP 14: File

-- ============================================================

INSERT INTO files (document_id, original_file_name, mime_type, file_size_kb, file_type_id)

VALUES (

    @document_id,

    CONCAT('answer_', @submission_id, '_', UNIX_TIMESTAMP(), '.pdf'),

    'application/pdf',

    512,

    @file_type_id

);

SET @file_id = LAST_INSERT_ID();
 
-- ============================================================

-- STEP 15: File Version (FIXED - only real columns)

-- ============================================================

INSERT INTO file_versions (file_id, version_number, blob_name, container_name, etag)

VALUES (

    @file_id,

    1,

    CONCAT('blob_', @file_id, '_v1_', UNIX_TIMESTAMP()),

    'exam-submissions',

    SHA2(CONCAT(@file_id, UNIX_TIMESTAMP()), 256)

);

SET @version_id = LAST_INSERT_ID();
 
-- ============================================================

-- STEP 16: Pages

-- ============================================================

INSERT INTO pages (version_id, page_number, width, height) VALUES (@version_id, 1, 1024, 768);

SET @page1_id = LAST_INSERT_ID();
 
INSERT INTO pages (version_id, page_number, width, height) VALUES (@version_id, 2, 1024, 768);

SET @page2_id = LAST_INSERT_ID();
 
INSERT INTO pages (version_id, page_number, width, height) VALUES (@version_id, 3, 1024, 768);

SET @page3_id = LAST_INSERT_ID();
 
-- ============================================================

-- STEP 17: Evaluation Status

-- ============================================================

INSERT IGNORE INTO evaluation_status (name) VALUES ('Completed');

SET @eval_status_id = (SELECT evaluation_status_id FROM evaluation_status WHERE name = 'Completed');
 
-- ============================================================

-- STEP 18: Evaluation

-- ============================================================

INSERT INTO evaluations (submission_id, faculty_id, marks_awarded, max_marks, remarks, status_id, evaluated_at)

VALUES (

    @submission_id, @faculty_id, 88, 100,

    CONCAT('Evaluated on ', DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')),

    @eval_status_id,

    NOW()

);

SET @evaluation_id = LAST_INSERT_ID();
 
-- ============================================================

-- STEP 19: Annotation Types

-- ============================================================

INSERT IGNORE INTO annotation_types (name) VALUES ('highlight'), ('comment'), ('underline'), ('draw');
 
SET @type_highlight = (SELECT annotation_type_id FROM annotation_types WHERE name = 'highlight');

SET @type_comment   = (SELECT annotation_type_id FROM annotation_types WHERE name = 'comment');

SET @type_underline = (SELECT annotation_type_id FROM annotation_types WHERE name = 'underline');

SET @type_draw      = (SELECT annotation_type_id FROM annotation_types WHERE name = 'draw');
 
-- ============================================================

-- STEP 20: Annotations

-- ============================================================

INSERT INTO annotations 

(

    evaluation_id,

    page_id,

    annotation_type_id,

    pos_x,

    pos_y,

    pos_width,

    pos_height,

    position_data,

    content,

    created_by_faculty_id

)

VALUES
 
(@evaluation_id, @page1_id, @type_highlight,

110,160,210,42,

JSON_OBJECT('type','highlight','x',110,'y',160,'width',210,'height',42,'color','yellow','timestamp',UNIX_TIMESTAMP()),

'Correct formula applied', @faculty_id),
 
(@evaluation_id, @page1_id, @type_comment,

330,190,1,1,

JSON_OBJECT('type','comment','x',330,'y',190,'timestamp',UNIX_TIMESTAMP()),

'Explain this derivation step', @faculty_id),
 
(@evaluation_id, @page2_id, @type_underline,

85,260,190,5,

JSON_OBJECT('type','underline','x',85,'y',260,'width',190,'color','blue','timestamp',UNIX_TIMESTAMP()),

'Key theorem reference', @faculty_id),
 
(@evaluation_id, @page2_id, @type_draw,

55,65,40,20,

JSON_OBJECT('type','draw','points',

JSON_ARRAY(

    JSON_OBJECT('x',55,'y',65),

    JSON_OBJECT('x',75,'y',85),

    JSON_OBJECT('x',95,'y',75)

),'color','red','timestamp',UNIX_TIMESTAMP()),

'Diagram is incorrect', @faculty_id),
 
(@evaluation_id, @page3_id, @type_highlight,

130,310,230,52,

JSON_OBJECT('type','highlight','x',130,'y',310,'width',230,'height',52,'color','green','timestamp',UNIX_TIMESTAMP()),

'Well-structured answer', @faculty_id),
 
(@evaluation_id, @page3_id, @type_comment,

410,330,1,1,

JSON_OBJECT('type','comment','x',410,'y',330,'timestamp',UNIX_TIMESTAMP()),

'Final answer is correct', @faculty_id);
 
-- ============================================================

-- STEP 21: Notifications

-- ============================================================

INSERT INTO notifications (user_id, entity_type, entity_id, message) VALUES

(@user_student_id, 'submission', @submission_id,

CONCAT('Your submission (ID: ', @submission_id, ') has been evaluated. Marks: 88/100'));
 
-- ============================================================

-- STEP 22: Audit Log

-- ============================================================

INSERT INTO audit_logs (entity_type, entity_id, field_name, old_value, new_value, changed_by_user_id) VALUES

('evaluations', @evaluation_id, 'status',        'Pending', 'Completed', @user_faculty_id),

('evaluations', @evaluation_id, 'marks_awarded',  NULL,     '88',        @user_faculty_id);
 
-- ============================================================

-- STEP 23: User Session

-- ============================================================

INSERT INTO user_sessions (user_id, session_token_hash, device_info, is_active) VALUES

(@user_faculty_id,

SHA2(CONCAT('session_', @user_faculty_id, '_', UNIX_TIMESTAMP()), 256),

JSON_OBJECT('browser','Chrome','ip','192.168.1.1','login_time', NOW()),

TRUE);
 
-- ============================================================

-- VERIFICATION

-- ============================================================

SELECT 'users'         AS tbl, COUNT(*) AS total FROM users

UNION ALL SELECT 'students',        COUNT(*) FROM students

UNION ALL SELECT 'faculty',         COUNT(*) FROM faculty

UNION ALL SELECT 'submissions',     COUNT(*) FROM submissions

UNION ALL SELECT 'documents',       COUNT(*) FROM documents

UNION ALL SELECT 'files',           COUNT(*) FROM files

UNION ALL SELECT 'file_versions',   COUNT(*) FROM file_versions

UNION ALL SELECT 'pages',           COUNT(*) FROM pages

UNION ALL SELECT 'evaluations',     COUNT(*) FROM evaluations

UNION ALL SELECT 'annotations',     COUNT(*) FROM annotations

UNION ALL SELECT 'notifications',   COUNT(*) FROM notifications

UNION ALL SELECT 'audit_logs',      COUNT(*) FROM audit_logs;

 