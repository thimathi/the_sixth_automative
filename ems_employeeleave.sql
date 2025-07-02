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
-- Table structure for table `employeeleave`
--

DROP TABLE IF EXISTS `employeeleave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeeleave` (
  `leaveId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `leaveStatus` varchar(255) DEFAULT NULL,
  `duration` bigint DEFAULT NULL,
  `leaveFromDate` date DEFAULT NULL,
  `leaveToDate` date DEFAULT NULL,
  `leaveReason` varchar(255) DEFAULT NULL,
  `leaveTypeId` varchar(36) DEFAULT (uuid()),
  `empId` varchar(36) DEFAULT (uuid()),
  `kpiId` varchar(36) DEFAULT (uuid()),
  `approvedBy` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`leaveId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeeleave`
--

LOCK TABLES `employeeleave` WRITE;
/*!40000 ALTER TABLE `employeeleave` DISABLE KEYS */;
INSERT INTO `employeeleave` VALUES ('00000000-0000-0000-0000-000000000032','2025-06-23 20:52:37','Approved',5,'2023-01-16','2023-01-20','Family vacation','66666666-6666-6666-6666-666666666666','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu',NULL),('00000000-0000-0000-0000-000000000033','2025-06-23 20:52:37','Approved',2,'2023-01-10','2023-01-11','Doctor appointment','77777777-7777-7777-7777-777777777777','llllllll-llll-llll-llll-llllllllllll','vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv',NULL),('00000000-0000-0000-0000-000000000034','2025-06-23 20:52:37','Pending',1,'2023-02-01','2023-02-01','Personal matter','88888888-8888-8888-8888-888888888888','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm','wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww',NULL),('a47eb85d-53e5-11f0-a786-89d48e4ac80b','2025-06-28 06:03:42','Half Day',1,'2025-06-28','2025-06-29','Pregnant Testing','a47eb872-53e5-11f0-a786-89d48e4ac80b','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','a47eb87a-53e5-11f0-a786-89d48e4ac80b',NULL);
/*!40000 ALTER TABLE `employeeleave` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:04
