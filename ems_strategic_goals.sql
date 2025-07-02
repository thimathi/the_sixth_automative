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
-- Table structure for table `strategic_goals`
--

DROP TABLE IF EXISTS `strategic_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `strategic_goals` (
  `goal_id` int NOT NULL AUTO_INCREMENT,
  `goal_name` varchar(255) DEFAULT NULL,
  `description` text,
  `year` year DEFAULT NULL,
  `quarter` tinyint DEFAULT NULL,
  `target_value` decimal(15,2) DEFAULT NULL,
  `current_value` decimal(15,2) DEFAULT NULL,
  `achieved` tinyint(1) DEFAULT '0',
  `weight` tinyint DEFAULT '1' COMMENT 'Importance weight (1-5)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`goal_id`),
  CONSTRAINT `strategic_goals_chk_1` CHECK ((`quarter` between 1 and 4))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `strategic_goals`
--

LOCK TABLES `strategic_goals` WRITE;
/*!40000 ALTER TABLE `strategic_goals` DISABLE KEYS */;
INSERT INTO `strategic_goals` VALUES (1,'Revenue Growth','Increase quarterly revenue by 15%',2025,NULL,15.00,12.50,0,5,'2025-06-26 18:25:29','2025-06-26 18:25:29'),(2,'Customer Satisfaction','Achieve 90% customer satisfaction',2025,NULL,90.00,87.00,0,4,'2025-06-26 18:25:29','2025-06-26 18:25:29'),(3,'Employee Retention','Reduce turnover to <5%',2025,2,5.00,4.80,1,3,'2025-06-26 18:25:29','2025-06-26 18:25:29'),(4,'Market Expansion','Enter 2 new markets',2025,3,2.00,1.00,0,4,'2025-06-26 18:25:29','2025-06-26 18:25:29'),(5,'Product Launch','Launch 3 new products',2025,4,3.00,0.00,0,5,'2025-06-26 18:25:29','2025-06-26 18:25:29'),(6,'Revenue Growth','Increase quarterly revenue by 10%',2024,NULL,10.00,11.20,1,5,'2025-06-26 18:25:29','2025-06-26 18:25:29'),(7,'Customer Satisfaction','Achieve 85% customer satisfaction',2024,NULL,85.00,84.00,0,4,'2025-06-26 18:25:29','2025-06-26 18:25:29');
/*!40000 ALTER TABLE `strategic_goals` ENABLE KEYS */;
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
