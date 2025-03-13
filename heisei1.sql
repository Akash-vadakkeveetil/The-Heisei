-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2025 at 08:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `heisei1`
--
CREATE DATABASE IF NOT EXISTS `heisei1` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `heisei1`;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `email` varchar(255) NOT NULL,
  `category` set('volunteer','campcoordinator') NOT NULL,
  `level` set('collector','gatherer') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`email`, `category`, `level`) VALUES
('camp1@gmail.com', 'campcoordinator', NULL),
('camp2@gmail.com', 'campcoordinator', NULL),
('volunteer1@gmail.com', 'volunteer', 'collector'),
('volunteer2@gmail.com', 'volunteer', 'gatherer'),
('volunteer3@gmail.com', 'volunteer', 'gatherer'),
('volunteer4@gmail.com', 'volunteer', 'collector'),
('volunteer5@gmail.com', 'volunteer', 'collector'),
('volunteer6@gmail.com', 'volunteer', 'gatherer'),
('volunteer7@gmail.com', 'volunteer', 'collector');

-- --------------------------------------------------------

--
-- Table structure for table `admininfo`
--

CREATE TABLE `admininfo` (
  `adminname` varchar(255) NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `contact` decimal(10,0) NOT NULL,
  `email` varchar(255) NOT NULL,
  `globalDurationParameter` decimal(2,1) NOT NULL DEFAULT 2.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admininfo`
--

INSERT INTO `admininfo` (`adminname`, `details`, `contact`, `email`, `globalDurationParameter`) VALUES
('adumu', 'heisei organisation administrator', 9119114560, 'forwardformation44@tutamail.com', 2.0);

-- --------------------------------------------------------

--
-- Table structure for table `camp1`
--

CREATE TABLE `camp1` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Not_available','Received') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `camp1list`
--

CREATE TABLE `camp1list` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) NOT NULL,
  `additionrequired` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `camp1list`
--

INSERT INTO `camp1list` (`commodityno`, `commodity`, `unit`, `stock`, `additionrequired`) VALUES
(1, 'rice', 'kg', 0, 0),
(7, 'wheat', 'kg', 0, 0),
(9, 'shirt-men-M', 'count', 0, 0),
(10, 'pant-men-M', 'count', 0, 0),
(21, 'potato', 'kg', 0, 0),
(27, 'pickle', 'g', 0, 0),
(28, 'cow-milk', 'litre', 0, 0),
(30, 'paracetamol-500mg', 'count', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `camp2`
--

CREATE TABLE `camp2` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Not_available','Received') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `camp2list`
--

CREATE TABLE `camp2list` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) NOT NULL,
  `additionrequired` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campresidents`
--

CREATE TABLE `campresidents` (
  `username` varchar(255) NOT NULL,
  `infants` int(11) NOT NULL DEFAULT 0,
  `toddlers` int(11) NOT NULL DEFAULT 0,
  `children` int(11) NOT NULL DEFAULT 0,
  `teens` int(11) NOT NULL DEFAULT 0,
  `young` int(11) NOT NULL DEFAULT 0,
  `pregnant` int(11) NOT NULL DEFAULT 0,
  `lactating` int(11) NOT NULL DEFAULT 0,
  `adults` int(11) NOT NULL DEFAULT 0,
  `middle_aged` int(11) NOT NULL DEFAULT 0,
  `seniors` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campresidents`
--

INSERT INTO `campresidents` (`username`, `infants`, `toddlers`, `children`, `teens`, `young`, `pregnant`, `lactating`, `adults`, `middle_aged`, `seniors`) VALUES
('camp1', 1, 0, 0, 0, 0, 0, 0, 5, 5, 0);

-- --------------------------------------------------------

--
-- Table structure for table `camps`
--

CREATE TABLE `camps` (
  `username` varchar(255) NOT NULL,
  `campcoordname` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `pinno` decimal(6,0) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `contact` decimal(10,0) NOT NULL,
  `blocked` set('yes','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `camps`
--

INSERT INTO `camps` (`username`, `campcoordname`, `location`, `pinno`, `latitude`, `longitude`, `contact`, `blocked`) VALUES
('camp1', 'coordi1', 'Thalassery Bus Stand (Anjarakandy side)', 670101, 11.749900, 75.494900, 113456788, 'no'),
('camp2', 'coordi2', 'Unnamed road, Kinavakkal, Thalassery, Kerala', 670643, 0.000000, 0.000000, 9113459778, 'no');

-- --------------------------------------------------------

--
-- Table structure for table `campslists`
--

CREATE TABLE `campslists` (
  `username` varchar(255) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `emergency` enum('yes','no') NOT NULL DEFAULT 'no',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `additionrequired` int(11) NOT NULL,
  `collected` int(11) NOT NULL DEFAULT 0,
  `gathered` int(11) NOT NULL DEFAULT 0,
  `expecton` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `commoditylive`
--

CREATE TABLE `commoditylive` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `additionrequired` int(11) DEFAULT NULL,
  `unit` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commoditylive`
--

INSERT INTO `commoditylive` (`commodityno`, `commodity`, `additionrequired`, `unit`) VALUES
(1, 'rice', 0, 'kg'),
(7, 'wheat', 0, 'kg'),
(9, 'shirt-men-M', 0, 'count'),
(10, 'pant-men-M', 0, 'count'),
(21, 'potato', 0, 'kg'),
(22, 'peas', 0, 'g'),
(23, 'pumpkin', 0, 'kg'),
(27, 'pickle', 0, 'g'),
(28, 'cow-milk', 0, 'litre'),
(29, 'chilli-powder', 0, 'g'),
(30, 'paracetamol-500mg', 0, 'count'),
(34, 'bath-soap', 0, 'g');

-- --------------------------------------------------------

--
-- Table structure for table `commoditytable`
--

CREATE TABLE `commoditytable` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `emergency` enum('yes','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commoditytable`
--

INSERT INTO `commoditytable` (`commodityno`, `commodity`, `unit`, `emergency`) VALUES
(34, 'bath-soap', 'g', 'no'),
(29, 'chilli-powder', 'g', 'no'),
(28, 'cow-milk', 'litre', 'no'),
(10, 'pant-men-M', 'count', 'no'),
(30, 'paracetamol-500mg', 'count', 'yes'),
(22, 'peas', 'g', 'no'),
(27, 'pickle', 'g', 'no'),
(21, 'potato', 'kg', 'no'),
(23, 'pumpkin', 'kg', 'no'),
(1, 'rice', 'kg', 'no'),
(9, 'shirt-men-M', 'count', 'no'),
(7, 'wheat', 'kg', 'no');

-- --------------------------------------------------------

--
-- Table structure for table `donorhistory`
--

CREATE TABLE `donorhistory` (
  `SIno` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `volunteerid` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `status` set('Not_received','Received') NOT NULL DEFAULT 'Not_received'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donors`
--

CREATE TABLE `donors` (
  `username` varchar(255) NOT NULL,
  `donorname` varchar(255) NOT NULL,
  `dob` date NOT NULL,
  `location` varchar(255) NOT NULL,
  `pinno` decimal(6,0) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `contactnumber` decimal(10,0) NOT NULL,
  `blocked` set('yes','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donors`
--

INSERT INTO `donors` (`username`, `donorname`, `dob`, `location`, `pinno`, `latitude`, `longitude`, `contactnumber`, `blocked`) VALUES
('donor1', 'don1', '2003-01-28', 'Unnamed road, Koothuparamba, Thalassery, Kerala', 670691, 11.812864, 75.576115, 9865231242, 'no'),
('donor2', 'don2', '2000-02-02', 'College Road, Thalassery, Kerala', 670107, 11.783412, 75.514810, 9898656535, 'no'),
('donor3', 'don3', '2003-03-03', 'Peringathur,Kerala', 670675, 11.722100, 75.585929, 9898656555, 'no');

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `category` set('donor','volunteer','campcoordinator','admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`username`, `email`, `password`, `category`) VALUES
('admin', 'admin@gmail.com', '$2b$10$ZyeoIJ3ACrv25J9aWSq9a.ElL3EWupp0JVOgiWu5i4JyiyfEd8BRS', 'admin'),
('camp1', 'camp1@gmail.com', '$2b$10$vJNqDOjvWBZ0Ad8hqy2fyOeSVWK88pj264ugCiFk8B4sJfCEWmNIG', 'campcoordinator'),
('camp2', 'camp2@gmail.com', '$2b$10$TcZngVJ0xXzAXQb0bIJjGukfDqGZ5VU6k3k9fNsFko1Ste.jYM9JW', 'campcoordinator'),
('donor1', 'donor1@gmail.com', '$2b$10$/8x4rjBZZszSoZ0qp6ZmOeUAu.OZd.GEt3OKVfWffUBGSPGXyYePW', 'donor'),
('donor2', 'donor2@gmail.com', '$2b$10$/EjDDdZHwJS0ogwt4kh1/.94OtWKw80L5SpUgZ8.OOQcZCx/8lNSq', 'donor'),
('donor3', 'donor3@gmail.com', '$2b$10$iWkohqaDAX6GQVGf4J2mcO1MI8LL5y4cULezoO5yYAO5syDiPPlZa', 'donor'),
('donor4', 'donor4@gmail.com', '$2b$10$BAy6G6CJBqS2j/hNsWE4XeyYPngqfApOqXix86A3RfZKJVwE.bAr.', 'donor'),
('donor5', 'donor5@gmail.com', '$2b$10$68A1fDue.b7R5oJD8DAus.4oWDxJs./fuHvlivSdix3Ta8DdRyPJa', 'donor'),
('volunteer1', 'volunteer1@gmail.com', '$2b$10$LVnhhXC2ilDB1t7Ap21lM.bv6sDoXRw2K7YaNht5az7iUI2Udj2eu', 'volunteer'),
('volunteer2', 'volunteer2@gmail.com', '$2b$10$vRhMCHeVZXso2RTfr.HkC.olH2/YpXDEL0T/KoQ6Fd03XyBpzIqV6', 'volunteer'),
('volunteer3', 'volunteer3@gmail.com', '$2b$10$TwBfEt5SCqEfPZgfYd//8eSp0v/VWzYxa0l9B017d3kd.eM6J30/u', 'volunteer'),
('volunteer4', 'volunteer4@gmail.com', '$2b$10$82gJk6fC1oRAeAxLlMLdpOMXCX8kbbl1m3y5wU63ZpGz.P/xkrOJu', 'volunteer'),
('volunteer5', 'volunteer5@gmail.com', '$2b$10$wpscXBrTPXb9Mqz3t46cp.99F02C3bAYItuxuROI1mMfF8JmA2cs.', 'volunteer'),
('volunteer6', 'volunteer6@gmail.com', '$2b$10$YWAoRwJSSkJIHoLywkPS8uwTBosisvesU3KBF8QnZE9G0LszatYRS', 'volunteer'),
('volunteer7', 'volunteer7@gmail.com', '$2b$10$oYHAkSsiUeWFTLxu94aJ3uYN42fXeHOfW92T61wrMnMvCK4IGn5DG', 'volunteer');

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `username` varchar(255) NOT NULL,
  `receiveno` int(11) NOT NULL,
  `transactionID` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volcamp`
--

CREATE TABLE `volcamp` (
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `volcamp`
--

INSERT INTO `volcamp` (`username`) VALUES
('camp1'),
('camp2'),
('volunteer1'),
('volunteer2'),
('volunteer3'),
('volunteer4'),
('volunteer5'),
('volunteer6'),
('volunteer7');

-- --------------------------------------------------------

--
-- Table structure for table `volcamphistory`
--

CREATE TABLE `volcamphistory` (
  `SIno` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `sendto` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `status` set('Not_received','Received') NOT NULL DEFAULT 'Not_received'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer1`
--

CREATE TABLE `volunteer1` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer1stock`
--

CREATE TABLE `volunteer1stock` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer2`
--

CREATE TABLE `volunteer2` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer2stock`
--

CREATE TABLE `volunteer2stock` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer3`
--

CREATE TABLE `volunteer3` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer3stock`
--

CREATE TABLE `volunteer3stock` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer4`
--

CREATE TABLE `volunteer4` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer4stock`
--

CREATE TABLE `volunteer4stock` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer5`
--

CREATE TABLE `volunteer5` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer5stock`
--

CREATE TABLE `volunteer5stock` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer6`
--

CREATE TABLE `volunteer6` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer6stock`
--

CREATE TABLE `volunteer6stock` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer7`
--

CREATE TABLE `volunteer7` (
  `receiveno` int(11) NOT NULL,
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `receivedfrom` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer7stock`
--

CREATE TABLE `volunteer7stock` (
  `commodityno` int(11) NOT NULL,
  `commodity` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `stock` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteers`
--

CREATE TABLE `volunteers` (
  `username` varchar(255) NOT NULL,
  `volname` varchar(255) NOT NULL,
  `contact` decimal(10,0) NOT NULL,
  `dob` date NOT NULL,
  `address` varchar(255) NOT NULL,
  `pinno` decimal(6,0) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `level` set('collector','gatherer') NOT NULL DEFAULT 'collector',
  `active` set('yes','no') NOT NULL DEFAULT 'yes',
  `availabilityfactor` int(11) NOT NULL DEFAULT 0,
  `blocked` set('yes','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `volunteers`
--

INSERT INTO `volunteers` (`username`, `volname`, `contact`, `dob`, `address`, `pinno`, `latitude`, `longitude`, `level`, `active`, `availabilityfactor`, `blocked`) VALUES
('volunteer1', 'volu1', 5120364780, '2007-01-04', 'college of enginering thalassery College Road, Kerala', 670107, 11.782363, 75.515503, 'collector', 'yes', 11, 'no'),
('volunteer2', 'volu2', 9113456788, '2000-06-06', 'manjodi', 670671, 11.735495, 75.512504, 'gatherer', 'yes', 0, 'no'),
('volunteer3', 'volu3', 123776088, '1998-07-15', 'madappeedika', 670642, 11.746869, 75.504722, 'gatherer', 'yes', 0, 'no'),
('volunteer4', 'volu4', 113456788, '2004-04-04', 'Panoor, Kerala', 670692, 11.759828, 75.577763, 'collector', 'yes', 20, 'no'),
('volunteer5', 'volu5', 3311224486, '2000-05-05', 'Nayanar Center Shankaranallur Metta Road, Thalassery, Kerala', 670643, 11.846392, 75.535280, 'collector', 'no', 4, 'no');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `admininfo`
--
ALTER TABLE `admininfo`
  ADD PRIMARY KEY (`adminname`,`contact`,`email`);

--
-- Indexes for table `camp1`
--
ALTER TABLE `camp1`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `camp1list`
--
ALTER TABLE `camp1list`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `camp2`
--
ALTER TABLE `camp2`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `camp2list`
--
ALTER TABLE `camp2list`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `campresidents`
--
ALTER TABLE `campresidents`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `camps`
--
ALTER TABLE `camps`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `contact` (`contact`);

--
-- Indexes for table `campslists`
--
ALTER TABLE `campslists`
  ADD PRIMARY KEY (`username`,`commodity`,`timestamp`),
  ADD KEY `campslists_ibfk_2` (`commodity`,`unit`,`emergency`);

--
-- Indexes for table `commoditylive`
--
ALTER TABLE `commoditylive`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `commoditytable`
--
ALTER TABLE `commoditytable`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD UNIQUE KEY `commodity_2` (`commodity`,`unit`,`emergency`),
  ADD KEY `idx_commodity` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `donorhistory`
--
ALTER TABLE `donorhistory`
  ADD PRIMARY KEY (`SIno`),
  ADD KEY `username` (`username`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `volunteerid` (`volunteerid`);

--
-- Indexes for table `donors`
--
ALTER TABLE `donors`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `contactnumber` (`contactnumber`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`username`,`receiveno`),
  ADD UNIQUE KEY `transactionID` (`transactionID`);

--
-- Indexes for table `volcamp`
--
ALTER TABLE `volcamp`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `volcamphistory`
--
ALTER TABLE `volcamphistory`
  ADD PRIMARY KEY (`SIno`),
  ADD KEY `username` (`username`),
  ADD KEY `sendto` (`sendto`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteer1`
--
ALTER TABLE `volunteer1`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `volunteer1stock`
--
ALTER TABLE `volunteer1stock`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteer2`
--
ALTER TABLE `volunteer2`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `volunteer2stock`
--
ALTER TABLE `volunteer2stock`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteer3`
--
ALTER TABLE `volunteer3`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `volunteer3stock`
--
ALTER TABLE `volunteer3stock`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteer4`
--
ALTER TABLE `volunteer4`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `volunteer4stock`
--
ALTER TABLE `volunteer4stock`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteer5`
--
ALTER TABLE `volunteer5`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `volunteer5stock`
--
ALTER TABLE `volunteer5stock`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteer6`
--
ALTER TABLE `volunteer6`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `volunteer6stock`
--
ALTER TABLE `volunteer6stock`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteer7`
--
ALTER TABLE `volunteer7`
  ADD PRIMARY KEY (`receiveno`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`),
  ADD KEY `receivedfrom` (`receivedfrom`);

--
-- Indexes for table `volunteer7stock`
--
ALTER TABLE `volunteer7stock`
  ADD PRIMARY KEY (`commodityno`),
  ADD UNIQUE KEY `commodity` (`commodity`),
  ADD KEY `commodityno` (`commodityno`,`commodity`,`unit`);

--
-- Indexes for table `volunteers`
--
ALTER TABLE `volunteers`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `contact` (`contact`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `camp1`
--
ALTER TABLE `camp1`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `camp2`
--
ALTER TABLE `camp2`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `commoditytable`
--
ALTER TABLE `commoditytable`
  MODIFY `commodityno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `donorhistory`
--
ALTER TABLE `donorhistory`
  MODIFY `SIno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `volcamphistory`
--
ALTER TABLE `volcamphistory`
  MODIFY `SIno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `volunteer1`
--
ALTER TABLE `volunteer1`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `volunteer2`
--
ALTER TABLE `volunteer2`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `volunteer3`
--
ALTER TABLE `volunteer3`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `volunteer4`
--
ALTER TABLE `volunteer4`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `volunteer5`
--
ALTER TABLE `volunteer5`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `volunteer6`
--
ALTER TABLE `volunteer6`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `volunteer7`
--
ALTER TABLE `volunteer7`
  MODIFY `receiveno` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `camp1`
--
ALTER TABLE `camp1`
  ADD CONSTRAINT `camp1_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `camp1_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `camp1list`
--
ALTER TABLE `camp1list`
  ADD CONSTRAINT `camp1list_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`);

--
-- Constraints for table `camp2`
--
ALTER TABLE `camp2`
  ADD CONSTRAINT `camp2_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `camp2_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `camp2list`
--
ALTER TABLE `camp2list`
  ADD CONSTRAINT `camp2list_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`);

--
-- Constraints for table `camps`
--
ALTER TABLE `camps`
  ADD CONSTRAINT `camps_ibfk_1` FOREIGN KEY (`username`) REFERENCES `login` (`username`);

--
-- Constraints for table `campslists`
--
ALTER TABLE `campslists`
  ADD CONSTRAINT `campslists_ibfk_1` FOREIGN KEY (`username`) REFERENCES `camps` (`username`),
  ADD CONSTRAINT `campslists_ibfk_2` FOREIGN KEY (`commodity`,`unit`,`emergency`) REFERENCES `commoditytable` (`commodity`, `unit`, `emergency`) ON DELETE CASCADE,
  ADD CONSTRAINT `campslists_ibfk_3` FOREIGN KEY (`username`) REFERENCES `camps` (`username`);

--
-- Constraints for table `commoditylive`
--
ALTER TABLE `commoditylive`
  ADD CONSTRAINT `commoditylive_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`);

--
-- Constraints for table `donorhistory`
--
ALTER TABLE `donorhistory`
  ADD CONSTRAINT `donorhistory_ibfk_1` FOREIGN KEY (`username`) REFERENCES `login` (`username`),
  ADD CONSTRAINT `donorhistory_ibfk_2` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `donorhistory_ibfk_3` FOREIGN KEY (`volunteerid`) REFERENCES `volunteers` (`username`);

--
-- Constraints for table `donors`
--
ALTER TABLE `donors`
  ADD CONSTRAINT `donors_ibfk_1` FOREIGN KEY (`username`) REFERENCES `login` (`username`);

--
-- Constraints for table `volcamp`
--
ALTER TABLE `volcamp`
  ADD CONSTRAINT `volcamp_ibfk_1` FOREIGN KEY (`username`) REFERENCES `login` (`username`);

--
-- Constraints for table `volcamphistory`
--
ALTER TABLE `volcamphistory`
  ADD CONSTRAINT `volcamphistory_ibfk_1` FOREIGN KEY (`username`) REFERENCES `volcamp` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `volcamphistory_ibfk_2` FOREIGN KEY (`sendto`) REFERENCES `volcamp` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `volcamphistory_ibfk_3` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteer1`
--
ALTER TABLE `volunteer1`
  ADD CONSTRAINT `volunteer1_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `volunteer1_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `volunteer1stock`
--
ALTER TABLE `volunteer1stock`
  ADD CONSTRAINT `volunteer1stock_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteer2`
--
ALTER TABLE `volunteer2`
  ADD CONSTRAINT `volunteer2_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `volunteer2_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `volunteer2stock`
--
ALTER TABLE `volunteer2stock`
  ADD CONSTRAINT `volunteer2stock_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteer3`
--
ALTER TABLE `volunteer3`
  ADD CONSTRAINT `volunteer3_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `volunteer3_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `volunteer3stock`
--
ALTER TABLE `volunteer3stock`
  ADD CONSTRAINT `volunteer3stock_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteer4`
--
ALTER TABLE `volunteer4`
  ADD CONSTRAINT `volunteer4_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `volunteer4_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `volunteer4stock`
--
ALTER TABLE `volunteer4stock`
  ADD CONSTRAINT `volunteer4stock_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteer5`
--
ALTER TABLE `volunteer5`
  ADD CONSTRAINT `volunteer5_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `volunteer5_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `volunteer5stock`
--
ALTER TABLE `volunteer5stock`
  ADD CONSTRAINT `volunteer5stock_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteer6`
--
ALTER TABLE `volunteer6`
  ADD CONSTRAINT `volunteer6_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `volunteer6_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `volunteer6stock`
--
ALTER TABLE `volunteer6stock`
  ADD CONSTRAINT `volunteer6stock_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteer7`
--
ALTER TABLE `volunteer7`
  ADD CONSTRAINT `volunteer7_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`),
  ADD CONSTRAINT `volunteer7_ibfk_2` FOREIGN KEY (`receivedfrom`) REFERENCES `login` (`username`);

--
-- Constraints for table `volunteer7stock`
--
ALTER TABLE `volunteer7stock`
  ADD CONSTRAINT `volunteer7stock_ibfk_1` FOREIGN KEY (`commodityno`,`commodity`,`unit`) REFERENCES `commoditytable` (`commodityno`, `commodity`, `unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `volunteers`
--
ALTER TABLE `volunteers`
  ADD CONSTRAINT `volunteers_ibfk_1` FOREIGN KEY (`username`) REFERENCES `login` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
