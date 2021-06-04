SELECT name  
FROM sys.objects  
WHERE type = 'UQ' AND OBJECT_NAME(parent_object_id) = N'tblCategory';
GO
-- Delete the unique constraint.  
ALTER TABLE dbo.tblCategory   
DROP CONSTRAINT UQ__tblCateg__E52A1BB3B42F3F19;
GO  