CREATE TABLE tblTask (
    taskId INT PRIMARY KEY NOT NULL IDENTITY(1, 1),
    title NVARCHAR(100) NOT NULL UNIQUE,
    checked BIT default 0 NOT NULL,
    favourite BIT default 0 NOT NULL,
    deleted BIT default 0 NOT NULL,
    dateCreated DATE NOT NULL,
    dateModified DATE,
    timeCreated TIME NOT NULL,
    timeModified TIME,
    categoryId INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_taskCategory FOREIGN KEY (categoryId) REFERENCES [TODO].[dbo].[tblCategory](categoryId)
);