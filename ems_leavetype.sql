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
-- Table structure for table `leavetype`
--

DROP TABLE IF EXISTS `leavetype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leavetype` (
  `leaveTypeId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `totalLeavePerMonth` varchar(255) DEFAULT NULL,
  `leaveType` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`leaveTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leavetype`
--

LOCK TABLES `leavetype` WRITE;
/*!40000 ALTER TABLE `leavetype` DISABLE KEYS */;
INSERT INTO `leavetype` VALUES ('66666666-6666-6666-6666-666666666666','2025-06-23 20:50:52','1.75','Annual Leave'),('77777777-7777-7777-7777-777777777777','2025-06-23 20:50:52','1','Sick Leave'),('88888888-8888-8888-8888-888888888888','2025-06-23 20:50:52','0.5','Personal Leave'),('8b18cf1e-4ebb-11f0-a5de-3a17c79ec5fe','2025-06-21 16:19:44','1.75','Annual Leave'),('8b193cc6-4ebb-11f0-a5de-3a17c79ec5fe','2025-06-21 16:19:44','1','Sick Leave'),('8b194761-4ebb-11f0-a5de-3a17c79ec5fe','2025-06-21 16:19:44','0.5','Personal Leave'),('8b1947fc-4ebb-11f0-a5de-3a17c79ec5fe','2025-06-21 16:19:44','0.25','Emergency Leave'),('8b19485b-4ebb-11f0-a5de-3a17c79ec5fe','2025-06-21 16:19:44','7','Maternity Leave'),('8b1948b5-4ebb-11f0-a5de-3a17c79ec5fe','2025-06-21 16:19:44','1','Paternity Leave'),('99999999-9999-9999-9999-999999999999','2025-06-23 20:50:52','0.25','Emergency Leave'),('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','2025-06-23 20:50:52','7','Maternity Leave'),('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','2025-06-23 20:50:52','1','Paternity Leave');
/*!40000 ALTER TABLE `leavetype` ENABLE KEYS */;
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
