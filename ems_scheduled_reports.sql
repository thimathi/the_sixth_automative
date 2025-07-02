-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: ems
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `scheduled_reports`
--

DROP TABLE IF EXISTS `scheduled_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_reports` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) NOT NULL,
  `schedule` varchar(255) NOT NULL,
  `recipients` json NOT NULL,
  `next_run` timestamp NOT NULL,
  `type` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` varchar(36) NOT NULL,
  `config` json DEFAULT NULL,
  `last_run` timestamp NULL DEFAULT NULL,
  `last_run_status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `scheduled_reports_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_reports`
--

LOCK TABLES `scheduled_reports` WRITE;
/*!40000 ALTER TABLE `scheduled_reports` DISABLE KEYS */;
INSERT INTO `scheduled_reports` VALUES ('00000000-0000-0000-0000-000000000067','2025-06-23 20:54:14','Monthly HR Report','0 0 1 * *','[\"hr@company.com\", \"management@company.com\"]','2023-01-31 18:30:00','HR',1,'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','{\"format\": \"PDF\", \"report_template\": \"00000000-0000-0000-0000-000000000064\"}',NULL,NULL),('00000000-0000-0000-0000-000000000068','2025-06-23 20:54:14','Bi-weekly Payroll','0 0 */14 * *','[\"finance@company.com\", \"payroll@company.com\"]','2023-01-27 18:30:00','Finance',1,'llllllll-llll-llll-llll-llllllllllll','{\"format\": \"Excel\", \"report_template\": \"00000000-0000-0000-0000-000000000065\"}',NULL,NULL),('00000000-0000-0000-0000-000000000069','2025-06-23 20:54:14','Daily Attendance','0 9 * * *','[\"operations@company.com\"]','2023-01-16 03:30:00','Operations',1,'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm','{\"format\": \"CSV\", \"report_template\": \"00000000-0000-0000-0000-000000000066\"}',NULL,NULL);
/*!40000 ALTER TABLE `scheduled_reports` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:00
