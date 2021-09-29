CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `FullName` tinytext NOT NULL,
  `OrganizationName` mediumtext NOT NULL,
  `PhoneNumber` varchar(15) NOT NULL,
  `EmailAddress` mediumtext NOT NULL,
  `TeamsAtOrganization` int(11) NOT NULL,
  `GeneralNotes` mediumtext NOT NULL,
  `Password` longtext NOT NULL,
  `Salt` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PhoneNumber` (`PhoneNumber`),
  UNIQUE KEY `key` (`id`),
  UNIQUE KEY `EmailAddress` (`EmailAddress`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
