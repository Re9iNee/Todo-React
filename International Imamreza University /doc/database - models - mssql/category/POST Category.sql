-- only Not Null Columns
INSERT INTO tblCategory (title, dateCreated, timeCreated) VALUES (N'1400 Resoloutions', '2020-1-1', '13:01');
-- all columns
INSERT INTO tblCategory (title, dateCreated, dateModified, timeCreated, timeModified, favourite, checked, deleted, [description]) VALUES (N'اهداف', '2020-12-29', '2020-12-29', '13:02', '13:03', 1, 0, 0, N'هیچ');