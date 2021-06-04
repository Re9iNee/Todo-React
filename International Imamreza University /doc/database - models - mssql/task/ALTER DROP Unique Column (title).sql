SELECT name  
FROM sys.objects  
WHERE type = 'UQ' AND OBJECT_NAME(parent_object_id) = N'tblTask';
GO
-- Delete the unique constraint.  
ALTER TABLE dbo.tblTask   
DROP CONSTRAINT UQ__tblTask__7716B4AE912E72B7;
GO  