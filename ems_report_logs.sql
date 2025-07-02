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
-- Table structure for table `report_logs`
--

DROP TABLE IF EXISTS `report_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_logs` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `report_id` varchar(36) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `message` text,
  `user_id` varchar(36) NOT NULL,
  `details` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_logs`
--

LOCK TABLES `report_logs` WRITE;
/*!40000 ALTER TABLE `report_logs` DISABLE KEYS */;
INSERT INTO `report_logs` VALUES ('00000000-0000-0000-0000-000000000061','2025-06-23 20:54:14','00000000-0000-0000-0000-000000000058','Generate','Success','Report generated successfully','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','{\"size\": \"2MB\", \"time_taken\": \"15s\"}'),('00000000-0000-0000-0000-000000000062','2025-06-23 20:54:14','00000000-0000-0000-0000-000000000059','Generate','Success','Report generated successfully','llllllll-llll-llll-llll-llllllllllll','{\"size\": \"1.5MB\", \"time_taken\": \"20s\"}'),('00000000-0000-0000-0000-000000000063','2025-06-23 20:54:14','00000000-0000-0000-0000-000000000060','Request','Pending','Report generation requested','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm','{\"estimated_time\": \"30s\"}'),('31e5ac95-556f-11f0-97eb-59848b2e43c7','2025-06-30 05:00:51','0','generate','success','otReport report generated successfully','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','{\"filters\": {}, \"fileSize\": \"3.09 KB\", \"executionTime\": \"69ms\"}'),('a68b9183-53ee-11f0-a786-89d48e4ac80b','2025-06-28 07:08:10',NULL,'generate','failed','Failed to generate otReport report','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','{\"error\": \"Cannot read properties of undefined (reading \'1\')\", \"filters\": {}}'),('f8a78369-53ee-11f0-a786-89d48e4ac80b','2025-06-28 07:10:28','0','generate','success','otReport report generated successfully','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','{\"filters\": {}, \"fileSize\": \"3.42 KB\", \"executionTime\": \"58ms\"}');
/*!40000 ALTER TABLE `report_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:07
