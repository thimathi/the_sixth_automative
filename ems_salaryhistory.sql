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
-- Table structure for table `salaryhistory`
--

DROP TABLE IF EXISTS `salaryhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salaryhistory` (
  `historyId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `empId` varchar(36) DEFAULT (uuid()),
  `name` varchar(255) DEFAULT NULL,
  `changeType` varchar(255) DEFAULT NULL,
  `previousSalary` decimal(20,0) DEFAULT NULL,
  `currentSalary` decimal(20,0) DEFAULT NULL,
  `effectiveDate` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`historyId`),
  KEY `empId` (`empId`),
  CONSTRAINT `salaryhistory_ibfk_1` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaryhistory`
--

LOCK TABLES `salaryhistory` WRITE;
/*!40000 ALTER TABLE `salaryhistory` DISABLE KEYS */;
INSERT INTO `salaryhistory` VALUES ('00000000-0000-0000-0000-000000000055','2025-06-23 20:52:37','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','John Smith','Promotion',40000,50000,'2022-06-15','Completed'),('00000000-0000-0000-0000-000000000056','2025-06-23 20:52:37','llllllll-llll-llll-llll-llllllllllll','Sarah Johnson','Promotion',37000,45000,'2022-07-01','Completed'),('00000000-0000-0000-0000-000000000057','2025-06-23 20:52:37','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm','Michael Brown','Annual Increment',38000,40000,'2022-12-01','Completed');
/*!40000 ALTER TABLE `salaryhistory` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:08
