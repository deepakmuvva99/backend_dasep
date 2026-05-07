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
-- Table structure for table `annotations`
--

DROP TABLE IF EXISTS `annotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annotations` (
  `annotation_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Unique annotation identifier',
  `evaluation_id` bigint NOT NULL COMMENT 'Reference to evaluation',
  `page_id` bigint NOT NULL COMMENT 'Reference to page being annotated',
  `annotation_type_id` int NOT NULL COMMENT 'Reference to annotation type',
  `pos_x` int NOT NULL COMMENT 'Annotation X coordinate (pixels from left)',
  `pos_y` int NOT NULL COMMENT 'Annotation Y coordinate (pixels from top)',
  `pos_width` int NOT NULL COMMENT 'Annotation bounding box width (pixels)',
  `pos_height` int NOT NULL COMMENT 'Annotation bounding box height (pixels)',
  `position_data` json DEFAULT NULL COMMENT 'Extra renderer metadata not needed for spatial queries',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Annotation content (text, feedback, etc.)',
  `created_by_faculty_id` int NOT NULL COMMENT 'Reference to faculty who created the annotation',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Annotation creation timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  `gen_pos_x` int GENERATED ALWAYS AS (`pos_x`) STORED COMMENT 'Generated column for pos_x index',
  `gen_pos_y` int GENERATED ALWAYS AS (`pos_y`) STORED COMMENT 'Generated column for pos_y index',
  PRIMARY KEY (`annotation_id`),
  KEY `idx_evaluation_page` (`evaluation_id`,`page_id`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_created_by_faculty_id` (`created_by_faculty_id`),
  KEY `idx_annotation_pos_x` (`gen_pos_x`),
  KEY `idx_annotation_pos_y` (`gen_pos_y`),
  KEY `fk_annotations_annotation_type_id` (`annotation_type_id`),
  CONSTRAINT `fk_annotations_annotation_type_id` FOREIGN KEY (`annotation_type_id`) REFERENCES `annotation_types` (`annotation_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_annotations_created_by_faculty_id` FOREIGN KEY (`created_by_faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_annotations_evaluation_id` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`evaluation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_annotations_page_id` FOREIGN KEY (`page_id`) REFERENCES `pages` (`page_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_pos_height_positive` CHECK ((`pos_height` > 0)),
  CONSTRAINT `chk_pos_width_positive` CHECK ((`pos_width` > 0)),
  CONSTRAINT `chk_pos_x_non_negative` CHECK ((`pos_x` >= 0)),
  CONSTRAINT `chk_pos_y_non_negative` CHECK ((`pos_y` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Annotations on answer sheet pages during evaluation';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annotations`
--

LOCK TABLES `annotations` WRITE;
/*!40000 ALTER TABLE `annotations` DISABLE KEYS */;
INSERT INTO `annotations` (`annotation_id`, `evaluation_id`, `page_id`, `annotation_type_id`, `pos_x`, `pos_y`, `pos_width`, `pos_height`, `position_data`, `content`, `created_by_faculty_id`, `created_at`, `updated_at`, `deleted_at`) VALUES (2,1,1,2,110,160,210,42,'{\"x\": 110, \"y\": 160, \"type\": \"highlight\", \"color\": \"yellow\", \"width\": 210, \"height\": 42, \"timestamp\": 1777034169}','Correct formula applied',3,'2026-04-24 12:36:09','2026-04-24 12:36:09',NULL),(3,1,1,4,330,190,1,1,'{\"x\": 330, \"y\": 190, \"type\": \"comment\", \"timestamp\": 1777034169}','Explain this derivation step',3,'2026-04-24 12:36:09','2026-04-24 12:36:09',NULL),(4,1,2,5,85,260,190,5,'{\"x\": 85, \"y\": 260, \"type\": \"underline\", \"color\": \"blue\", \"width\": 190, \"timestamp\": 1777034169}','Key theorem reference',3,'2026-04-24 12:36:09','2026-04-24 12:36:09',NULL),(5,1,2,6,55,65,40,20,'{\"type\": \"draw\", \"color\": \"red\", \"points\": [{\"x\": 55, \"y\": 65}, {\"x\": 75, \"y\": 85}, {\"x\": 95, \"y\": 75}], \"timestamp\": 1777034169}','Diagram is incorrect',3,'2026-04-24 12:36:09','2026-04-24 12:36:09',NULL),(6,1,3,2,130,310,230,52,'{\"x\": 130, \"y\": 310, \"type\": \"highlight\", \"color\": \"green\", \"width\": 230, \"height\": 52, \"timestamp\": 1777034169}','Well-structured answer',3,'2026-04-24 12:36:09','2026-04-24 12:36:09',NULL),(7,1,3,4,410,330,1,1,'{\"x\": 410, \"y\": 330, \"type\": \"comment\", \"timestamp\": 1777034169}','Final answer is correct',3,'2026-04-24 12:36:09','2026-04-24 12:36:09',NULL);
/*!40000 ALTER TABLE `annotations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:38:17
