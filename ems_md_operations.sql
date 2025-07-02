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
-- Table structure for table `md_operations`
--

DROP TABLE IF EXISTS `md_operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `md_operations` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `operation` varchar(100) NOT NULL,
  `record_id` varchar(36) NOT NULL,
  `md_id` varchar(36) NOT NULL,
  `operation_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `details` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `md_id` (`md_id`),
  CONSTRAINT `md_operations_ibfk_1` FOREIGN KEY (`md_id`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `md_operations`
--

LOCK TABLES `md_operations` WRITE;
/*!40000 ALTER TABLE `md_operations` DISABLE KEYS */;
INSERT INTO `md_operations` VALUES ('00000000-0000-0000-0000-000000000085','Budget Approved','00000000-0000-0000-0000-000000000068','oooooooo-oooo-oooo-oooo-oooooooooooo','2025-06-23 20:54:14','{\"amount\": 5000000, \"fiscal_year\": 2023}'),('00000000-0000-0000-0000-000000000086','Policy Approved','00000000-0000-0000-0000-000000000041','oooooooo-oooo-oooo-oooo-oooooooooooo','2025-06-23 20:54:14','{\"policy_type\": \"Leave\", \"effective_date\": \"2023-01-01\"}'),('00000000-0000-0000-0000-000000000087','Senior Promotion Approved','00000000-0000-0000-0000-000000000050','oooooooo-oooo-oooo-oooo-oooooooooooo','2025-06-23 20:54:14','{\"employee\": \"John Smith\", \"new_position\": \"HR Manager\"}');
/*!40000 ALTER TABLE `md_operations` ENABLE KEYS */;
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
