-- Without Params
SELECT TOP (1000) [categoryId]
      ,[title]
      ,[dateCreated]
      ,[dateModified]
      ,[timeCreated]
      ,[timeModified]
      ,[favourite]
      ,[checked]
      ,[deleted]
      ,[description]
  FROM [TODO].[dbo].[tblCategory]
  WHERE deleted = 0;

--   With Params
SELECT TOP (1000) [categoryId]
      ,[title]
      ,[dateCreated]
      ,[dateModified]
      ,[timeCreated]
      ,[timeModified]
      ,[favourite]
      ,[checked]
      ,[deleted]
      ,[description]
  FROM [TODO].[dbo].[tblCategory]
  WHERE deleted = 0 AND title = 'Today' AND categoryId = 1 AND favourite = 0 AND checked = 0 AND timeCreated = '1:11' AND dateCreated = '2020-05-17';