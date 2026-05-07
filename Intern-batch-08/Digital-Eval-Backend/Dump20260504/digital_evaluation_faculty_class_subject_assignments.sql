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
-- Table structure for table `faculty_class_subject_assignments`
--

DROP TABLE IF EXISTS `faculty_class_subject_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_class_subject_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique assignment identifier',
  `faculty_id` int NOT NULL COMMENT 'Reference to faculty',
  `subject_id` int NOT NULL COMMENT 'Reference to subject',
  `class_id` int NOT NULL COMMENT 'Reference to class',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Assignment date',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Assignment creation timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`assignment_id`),
  UNIQUE KEY `unique_faculty_subject_class` (`faculty_id`,`subject_id`,`class_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_class_subject` (`class_id`,`subject_id`,`deleted_at`),
  CONSTRAINT `fk_fcsa_class_id` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fcsa_faculty_id` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fcsa_subject_id` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Faculty assignments to teach specific subjects in specific classes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_class_subject_assignments`
--

LOCK TABLES `faculty_class_subject_assignments` WRITE;
/*!40000 ALTER TABLE `faculty_class_subject_assignments` DISABLE KEYS */;
INSERT INTO `faculty_class_subject_assignments` VALUES (1,1,1,1,'2026-04-24 10:26:37','2026-04-24 10:26:37','2026-04-24 10:26:37',NULL),(2,2,2,1,'2026-04-24 10:26:37','2026-04-24 10:26:37','2026-04-24 10:26:37',NULL),(3,3,4,3,'2026-04-24 12:36:09','2026-04-24 12:36:09','2026-04-24 12:36:09',NULL),(4,7,3,1,'2026-04-30 10:17:30','2026-04-30 10:17:30','2026-04-30 10:17:30',NULL),(5,7,4,7,'2026-05-03 05:22:46','2026-05-03 05:22:46','2026-05-03 05:22:46',NULL),(6,7,3,3,'2026-05-03 05:37:39','2026-05-03 05:37:39','2026-05-03 05:37:39',NULL),(7,7,1,3,'2026-05-03 06:23:04','2026-05-03 06:23:04','2026-05-03 06:23:04',NULL),(8,7,4,3,'2026-05-03 07:42:00','2026-05-03 07:42:00','2026-05-03 07:42:00',NULL);
/*!40000 ALTER TABLE `faculty_class_subject_assignments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:37:58
