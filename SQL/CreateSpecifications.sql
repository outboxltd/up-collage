CREATE TABLE `specifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `TransactionID` int(11) DEFAULT NULL,
  `ProductID` int(11) DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Date` datetime DEFAULT NULL,
  `CourseInstructorName` varchar(45) DEFAULT NULL,
  `CourseInstructorPhone` varchar(45) DEFAULT NULL,
  `CourseInstructorEmail` varchar(45) DEFAULT NULL,
  `ExpiredCourseTimeDate` datetime DEFAULT NULL,
  `Address` varchar(45) DEFAULT NULL,
  `NumberOfCourseParticipants` varchar(45) DEFAULT NULL,
  `GeneralNotes` varchar(45) DEFAULT NULL,
  `Number` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
