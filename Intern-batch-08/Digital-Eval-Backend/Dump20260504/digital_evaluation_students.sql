-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: dasep-mysql-test-01.mysql.database.azure.com    Database: digital_evaluation
-- ------------------------------------------------------
-- Server version	8.0.44-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique student identifier',
  `user_id` int NOT NULL COMMENT 'Reference to user account',
  `institution_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Institution/Roll number',
  `class_id` int NOT NULL COMMENT 'Reference to class',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Student active status',
  `created_by_user_id` int NOT NULL COMMENT 'Reference to user who created this record',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Student record creation timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `unique_institution_id` (`institution_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_class_active` (`class_id`,`is_active`,`deleted_at`),
  KEY `fk_students_created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `fk_students_class_id` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_students_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_students_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Student records';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,4,'STU001',1,1,1,'2026-04-24 10:26:37','2026-04-24 10:26:37',NULL),(2,5,'STU002',1,1,1,'2026-04-24 10:26:37','2026-04-24 10:26:37',NULL),(3,7,'S1777034169',3,1,6,'2026-04-24 12:36:09','2026-04-24 12:36:09',NULL),(4,13,'TEST_STU_001',1,1,1,'2026-04-27 11:11:08','2026-04-27 11:11:08',NULL),(5,14,'TEST_STU_002',1,1,1,'2026-04-27 11:27:00','2026-04-27 11:27:00',NULL),(6,15,'STU0067',1,1,1,'2026-04-27 11:40:36','2026-04-27 11:40:36',NULL),(7,16,'STU0078',3,1,1,'2026-04-27 11:41:08','2026-04-27 11:41:08',NULL),(8,17,'STU0055',1,1,1,'2026-04-27 11:42:39','2026-04-27 11:42:39',NULL),(9,18,'STU0077',2,1,1,'2026-04-27 11:44:11','2026-04-27 11:44:11',NULL),(10,19,'STU00665',1,1,1,'2026-04-27 11:48:05','2026-04-27 11:48:05',NULL),(11,25,'STU00660',1,1,1,'2026-04-27 12:44:02','2026-04-27 12:44:02',NULL),(12,26,'STU0022',3,1,1,'2026-04-28 11:21:22','2026-04-28 11:21:22',NULL),(13,28,'STU0091',1,1,1,'2026-04-29 12:34:56','2026-04-29 12:34:56',NULL),(14,33,'STU101',1,1,1,'2026-04-30 09:19:05','2026-04-30 09:19:05',NULL),(15,34,'STU200',2,1,1,'2026-04-30 11:52:15','2026-04-30 11:52:15',NULL),(16,35,'STU207',5,1,1,'2026-05-02 18:09:43','2026-05-02 18:09:43',NULL),(17,36,'STU0076',3,1,1,'2026-05-02 19:06:15','2026-05-02 19:06:15',NULL),(18,37,'STU0148',2,1,1,'2026-05-02 19:08:28','2026-05-02 19:08:28',NULL);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:37:52
