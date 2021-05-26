SELECT TOP (1000) 
        task.[taskId] 
        ,task.[title]
        ,task.[checked]
        ,task.[favourite]
        ,task.[dateCreated]
        ,task.[dateModified]
        ,task.[timeCreated]
        ,task.[timeModified]
        ,task.[categoryId]
  FROM [TODO].[dbo].[tblTask] as task
  INNER JOIN [TODO].[dbo].[tblCategory] as category
  on category.categoryId = task.categoryId
  WHERE 
  task.deleted = 0
  AND 
  category.deleted = 0