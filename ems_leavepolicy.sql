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
-- Table structure for table `leavepolicy`
--

DROP TABLE IF EXISTS `leavepolicy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leavepolicy` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `leaveType` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `annualEntitlement` decimal(20,0) DEFAULT NULL,
  `carryOverRules` varchar(255) DEFAULT NULL,
  `noticePeriod` varchar(255) DEFAULT NULL,
  `documentationRequired` varchar(255) DEFAULT NULL,
  `approvalWorkflow` varchar(255) DEFAULT NULL,
  `leaveTypeId` varchar(36) DEFAULT (uuid()),
  `leaveId` varchar(36) DEFAULT (uuid()),
  `empId` varchar(36) DEFAULT (uuid()),
  PRIMARY KEY (`id`),
  KEY `empId` (`empId`),
  KEY `leaveTypeId` (`leaveTypeId`),
  KEY `leaveId` (`leaveId`),
  CONSTRAINT `leavepolicy_ibfk_1` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`),
  CONSTRAINT `leavepolicy_ibfk_2` FOREIGN KEY (`leaveTypeId`) REFERENCES `leavetype` (`leaveTypeId`),
  CONSTRAINT `leavepolicy_ibfk_3` FOREIGN KEY (`leaveId`) REFERENCES `employeeleave` (`leaveId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leavepolicy`
--

LOCK TABLES `leavepolicy` WRITE;
/*!40000 ALTER TABLE `leavepolicy` DISABLE KEYS */;
INSERT INTO `leavepolicy` VALUES ('00000000-0000-0000-0000-000000000041','2025-06-23 20:52:37','Annual Leave','Standard annual leave policy',21,'Max 5 days can be carried over','2 weeks','None','Manager approval','66666666-6666-6666-6666-666666666666','00000000-0000-0000-0000-000000000032','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk'),('00000000-0000-0000-0000-000000000042','2025-06-23 20:52:37','Sick Leave','Standard sick leave policy',12,'Cannot be carried over','As soon as possible','Medical certificate for >3 days','Manager approval','77777777-7777-7777-7777-777777777777','00000000-0000-0000-0000-000000000033','llllllll-llll-llll-llll-llllllllllll');
/*!40000 ALTER TABLE `leavepolicy` ENABLE KEYS */;
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
