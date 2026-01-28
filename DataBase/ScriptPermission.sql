INSERT INTO `gpa`.`GPA_Roles` (`ROL_id`, `ROL_name`, `ROL_notifications_for`) VALUES ('1', 'admin', 'E');

INSERT INTO `gpa`.`GPA_Users` (`USR_id`, `USR_email`, `USR_active`, `USR_role_id`, `USR_name`, `USR_f_lastname`, `USR_s_lastname`, `USR_creation_date`, `USR_last_access_date`) VALUES ('1', 'test@gmail.com', '1', '1', 'Nombre', 'PApellido', 'SApellido', '2025-10-10', '2026-01-01');

INSERT INTO `gpa`.`GPA_Permission_type` (`PTY_name`, `PTY_id`) VALUES ('Edit', '1');
INSERT INTO `gpa`.`GPA_Permission_type` (`PTY_name`, `PTY_id`) VALUES ('View', '2');
INSERT INTO `gpa`.`GPA_Permission_type` (`PTY_name`, `PTY_id`) VALUES ('Create', '3');
INSERT INTO `gpa`.`GPA_Permission_type` (`PTY_name`, `PTY_id`) VALUES ('All', '4');

INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('1', 'clientes');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('2', 'clientes-id');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('3', 'clientes-id-editar');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('4', 'clientes-nuevo');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('5', 'proyectos');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('6', 'proyectos-id');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('7', 'proyectos-id-editar');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('8', 'proyectos-nuevo');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('9', 'pagos');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('10', 'pagos-nuevo');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('11', 'reportes');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('12', 'usuarios');
INSERT INTO `gpa`.`GPA_Screen` (`SCN_id`, `SCN_name`) VALUES ('13', 'usuarios-administrar-roles');

INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('2', '1', '1');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('2', '2', '2');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('1', '3', '3');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('3', '4', '4');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('2', '5', '5');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('2', '6', '6');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('1', '7', '7');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('3', '8', '8');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('2', '9', '9');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('3', '10', '10');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('4', '11', '11');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('4', '12', '12');
INSERT INTO `gpa`.`GPA_Permission` (`PTY_id`, `SCN_id`, `PSN_id`) VALUES ('4', '13', '13');

INSERT INTO `gpa`.`GPA_Notifications_types` (`NTP_id`, `NTP_name`) VALUES ('1', 'Proyectos');
INSERT INTO `gpa`.`GPA_Notifications_types` (`NTP_id`, `NTP_name`) VALUES ('2', 'Personal');