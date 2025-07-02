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
-- Table structure for table `manager_operations`
--

DROP TABLE IF EXISTS `manager_operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_operations` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `operation` varchar(100) NOT NULL,
  `record_id` varchar(36) NOT NULL,
  `manager_id` varchar(36) NOT NULL,
  `operation_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `details` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `manager_operations_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_operations`
--

LOCK TABLES `manager_operations` WRITE;
/*!40000 ALTER TABLE `manager_operations` DISABLE KEYS */;
INSERT INTO `manager_operations` VALUES ('00000000-0000-0000-0000-000000000079','Leave Approved','00000000-0000-0000-0000-000000000032','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','2025-06-23 20:54:14','{\"duration\": 5, \"leave_type\": \"Annual\"}'),('00000000-0000-0000-0000-000000000080','Task Assigned','00000000-0000-0000-0000-000000000073','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','2025-06-23 20:54:14','{\"task\": \"Complete HR Policy Update\", \"priority\": \"High\"}'),('00000000-0000-0000-0000-000000000081','Promotion Approved','00000000-0000-0000-0000-000000000050','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','2025-06-23 20:54:14','{\"new_position\": \"HR Manager\", \"old_position\": \"HR Associate\"}');
/*!40000 ALTER TABLE `manager_operations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:02
