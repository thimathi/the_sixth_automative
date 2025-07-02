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
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `format` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_by` varchar(36) NOT NULL,
  `download_url` varchar(255) DEFAULT NULL,
  `config` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES ('00000000-0000-0000-0000-000000000058','2025-06-23 20:54:07','Employee List','HR','PDF','Generated','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','/reports/employee_list.pdf',NULL),('00000000-0000-0000-0000-000000000059','2025-06-23 20:54:07','Salary Report','Finance','Excel','Generated','llllllll-llll-llll-llll-llllllllllll','/reports/salary_report.xlsx',NULL),('00000000-0000-0000-0000-000000000060','2025-06-23 20:54:07','Attendance Summary','Operations','PDF','Pending','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',NULL,NULL),('31e2b381-556f-11f0-97eb-59848b2e43c7','2025-06-30 05:00:51','otReport Report','otReport','PDF','Generated','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','/reports/1751259651510.pdf','{\"period\": \"Q2 2025\", \"filters\": {}, \"generatedAt\": \"2025-06-30T05:00:51.510Z\", \"recordCount\": 0}'),('f8a6684a-53ee-11f0-a786-89d48e4ac80b','2025-06-28 07:10:28','otReport Report','otReport','PDF','Generated','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','/reports/1751094628735.pdf','{\"period\": \"Q2 2025\", \"filters\": {}, \"generatedAt\": \"2025-06-28T07:10:28.735Z\", \"recordCount\": 0}');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:03
