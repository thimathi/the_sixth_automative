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
-- Table structure for table `employeereports`
--

DROP TABLE IF EXISTS `employeereports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeereports` (
  `reportId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `period` varchar(255) DEFAULT NULL,
  `generatedDate` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `fileSize` varchar(255) DEFAULT NULL,
  `filePath` varchar(255) DEFAULT NULL,
  `empId` varchar(36) DEFAULT (uuid()),
  PRIMARY KEY (`reportId`),
  KEY `empId` (`empId`),
  CONSTRAINT `employeereports_ibfk_1` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeereports`
--

LOCK TABLES `employeereports` WRITE;
/*!40000 ALTER TABLE `employeereports` DISABLE KEYS */;
INSERT INTO `employeereports` VALUES ('00000000-0000-0000-0000-000000000020','2025-06-23 20:52:37','Monthly Attendance','Attendance report for December 2022','Attendance','Monthly','2023-01-05','Generated','2MB','/reports/attendance_dec2022.pdf','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk'),('00000000-0000-0000-0000-000000000021','2025-06-23 20:52:37','Annual Performance','Annual performance review 2022','Performance','Annual','2023-01-10','Generated','3MB','/reports/performance_2022.pdf','llllllll-llll-llll-llll-llllllllllll'),('00000000-0000-0000-0000-000000000022','2025-06-23 20:52:37','Leave Balance','Leave balance as of December 2022','Leave','Monthly','2023-01-05','Generated','1MB','/reports/leave_balance_dec2022.pdf','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm');
/*!40000 ALTER TABLE `employeereports` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:06
