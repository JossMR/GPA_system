/*
Created: 27/5/2025
Modified: 1/10/2025
Model: RE MySQL 8.0
Database: MySQL 8.0
*/

-- Create tables section -------------------------------------------------

-- Table GPA_Roles

CREATE TABLE GPA_Roles
(
  ROL_id Int AUTO_INCREMENT,
  ROL_name Varchar(50) NOT NULL,
  PRIMARY KEY (ROL_id)
)
;

-- Table GPA_Users

CREATE TABLE GPA_Users
(
  USR_id Int AUTO_INCREMENT,
  USR_email Varchar(150) NOT NULL,
  USR_active Bool NOT NULL DEFAULT TRUE,
  USR_role_id Int NOT NULL,
  USR_name Varchar(30) NOT NULL,
  USR_f_lastname Varchar(30) NOT NULL,
  USR_s_lastname Varchar(30) NOT NULL,
  USR_creation_date Datetime NOT NULL,
  USR_last_access_date Datetime,
  PRIMARY KEY (USR_id)
)
;

-- Table GPA_Clients

CREATE TABLE GPA_Clients
(
  CLI_id Int AUTO_INCREMENT,
  CLI_name Varchar(50) NOT NULL,
  CLI_email Varchar(150),
  CLI_phone Varchar(20) NOT NULL,
  CLI_additional_directions Text,
  CLI_civil_status Enum('Single','Married','Divorced','Widowed') DEFAULT 'Single',
  CLI_observations Text,
  CLI_f_lastname Varchar(50),
  CLI_s_lastname Varchar(50),
  CLI_identificationtype Enum('national','dimex','passport','refugee','nite','entity') NOT NULL,
  CLI_identification Varchar(50) NOT NULL,
  CLI_isperson Bool NOT NULL DEFAULT true,
  CLI_province Text,
  CLI_canton Text,
  CLI_district Text,
  CLI_neighborhood Text,
  PRIMARY KEY (CLI_id)
)
;

-- Table GPA_ClientDelinquency

CREATE TABLE GPA_ClientDelinquency
(
  DEL_id Int AUTO_INCREMENT,
  DEL_client_id Int NOT NULL,
  DEL_note Text,
  DEL_date Timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (DEL_id)
)
;

-- Table GPA_Payments

CREATE TABLE GPA_Payments
(
  PAY_id Int AUTO_INCREMENT,
  PAY_amount_due Decimal(12,2) NOT NULL,
  PAY_amount_paid Decimal(12,2) NOT NULL DEFAULT 0,
  PAY_due_date Date,
  PAY_payment_date Date,
  PAY_description Text,
  PAY_project_id Int,
  PRIMARY KEY (PAY_id)
)
;

-- Table GPA_Categories

CREATE TABLE GPA_Categories
(
  CAT_id Int AUTO_INCREMENT,
  CAT_name Varchar(100) NOT NULL,
  PRIMARY KEY (CAT_id)
)
;

-- Table GPA_Types

CREATE TABLE GPA_Types
(
  TYP_id Int AUTO_INCREMENT,
  TYP_name Varchar(100) NOT NULL,
  PRIMARY KEY (TYP_id)
)
;

-- Table GPA_Projects

CREATE TABLE GPA_Projects
(
  PRJ_id Int AUTO_INCREMENT,
  PRJ_client_id Int NOT NULL,
  PRJ_case_number Varchar(50) NOT NULL,
  PRJ_area_m2 Decimal(10,2),
  PRJ_additional_directions Text,
  PRJ_budget Decimal(12,2),
  PRJ_entry_date Date,
  PRJ_completion_date Date,
  PRJ_logbook_number Varchar(50),
  PRJ_logbook_close_date Date,
  PRJ_type_id Int NOT NULL,
  PRJ_state Enum('Document Collection','Technical Inspection','Document Review','Plans and Budget','Entity Review','APC and Permits','Disbursement','Under Construction','Completed','Logbook Closed','Rejected','Professional Withdrawal','Conditioned') DEFAULT 'Document Collection',
  PRJ_final_price Decimal(12,2),
  PRJ_notes Text,
  PRJ_province Text,
  PRJ_canton Text,
  PRJ_district Text,
  PRJ_neighborhood Text,
  PRJ_start_contruction_date Date,
  PRIMARY KEY (PRJ_id)
)
;

-- Table GPA_Documents

CREATE TABLE GPA_Documents
(
  DOC_id Int AUTO_INCREMENT,
  DOC_project_id Int NOT NULL,
  DOC_name Varchar(200),
  DOC_file_path Text,
  DOC_upload_date Timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  DOC_filetype_id Int NOT NULL,
  PRIMARY KEY (DOC_id)
)
;

-- Table GPA_Notifications

CREATE TABLE GPA_Notifications
(
  NOT_id Int AUTO_INCREMENT,
  NOT_user_id Int,
  NOT_message Text NOT NULL,
  NOT_read Bool DEFAULT FALSE,
  NOT_created_at Timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (NOT_id)
)
;

-- Table GPA_Observations

CREATE TABLE GPA_Observations
(
  OST_id Int NOT NULL AUTO_INCREMENT,
  OST_project_id Int NOT NULL,
  OST_content Text,
  OST_date Timestamp NOT NULL,
  PRIMARY KEY (OST_id)
)
;

-- Table GPA_FileTypes

CREATE TABLE GPA_FileTypes
(
  FTP_id Int NOT NULL AUTO_INCREMENT,
  FTP_name Varchar(50) NOT NULL,
  PRIMARY KEY (FTP_id)
)
;

-- Table GPA_Additions

CREATE TABLE GPA_Additions
(
  ATN_id Int NOT NULL AUTO_INCREMENT,
  ATN_name Varchar(50),
  ATN_description Text,
  ATN_project_id Int,
  ATN_cost Decimal(12,2),
  ATN_date Date,
  PRIMARY KEY (ATN_id)
)
;

-- Table GPA_ProjectsXGPA_Categories

CREATE TABLE GPA_ProjectsXGPA_Categories
(
  PRJ_id Int,
  CAT_id Int
)
;

ALTER TABLE GPA_ProjectsXGPA_Categories ADD PRIMARY KEY (PRJ_id, CAT_id)
;

-- Create foreign keys (relationships) section -------------------------------------------------

ALTER TABLE GPA_Users ADD CONSTRAINT fk_GPA_Roles_GPA_Users_0 FOREIGN KEY (USR_role_id) REFERENCES GPA_Roles (ROL_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_ClientDelinquency ADD CONSTRAINT fk_GPA_Clients_GPA_ClientDelinquency_0 FOREIGN KEY (DEL_client_id) REFERENCES GPA_Clients (CLI_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Projects ADD CONSTRAINT fk_GPA_Clients_GPA_Projects_0 FOREIGN KEY (PRJ_client_id) REFERENCES GPA_Clients (CLI_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Projects ADD CONSTRAINT fk_GPA_Types_GPA_Projects_2 FOREIGN KEY (PRJ_type_id) REFERENCES GPA_Types (TYP_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Documents ADD CONSTRAINT fk_GPA_Projects_GPA_Documents_0 FOREIGN KEY (DOC_project_id) REFERENCES GPA_Projects (PRJ_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Notifications ADD CONSTRAINT fk_GPA_Users_GPA_Notifications_0 FOREIGN KEY (NOT_user_id) REFERENCES GPA_Users (USR_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Observations ADD CONSTRAINT fk_GPA_Projects_GPA_Observation_0 FOREIGN KEY (OST_project_id) REFERENCES GPA_Projects (PRJ_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Payments ADD CONSTRAINT fk_GPA_Projects_GPA_Payments_0 FOREIGN KEY (PAY_project_id) REFERENCES GPA_Projects (PRJ_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Documents ADD CONSTRAINT fk_GPA_Documents_GPA_FileType_0 FOREIGN KEY (DOC_filetype_id) REFERENCES GPA_FileTypes (FTP_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_Additions ADD CONSTRAINT fk_GPA_Projects_GPA_Addition_0 FOREIGN KEY (ATN_project_id) REFERENCES GPA_Projects (PRJ_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_ProjectsXGPA_Categories ADD CONSTRAINT fk_GPA_Categories_GPA_Projects_1 FOREIGN KEY (PRJ_id) REFERENCES GPA_Projects (PRJ_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE GPA_ProjectsXGPA_Categories ADD CONSTRAINT fk_GPA_Categories_GPA_Projects_2 FOREIGN KEY (CAT_id) REFERENCES GPA_Categories (CAT_id) ON DELETE RESTRICT ON UPDATE RESTRICT
;

