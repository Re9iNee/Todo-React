CREATE TABLE tblCategory (
    categoryId int IDENTITY(1, 1) PRIMARY KEY NOT NULL,
    title NVARCHAR(100) UNIQUE NOT NULL,
    dateCreated DATE NOT NULL,
    dateModified DATE,
    timeCreated TIME NOT NULL,
    timeModified TIME,
    favourite BIT DEFAULT 0 NOT NULL,
    checked BIT DEFAULT 0 NOT NULL,
    deleted BIT DEFAULT 0 NOT NULL,
    description TEXT
);
INSERT INTO tblCategory (title, dateCreated, timeCreated) VALUES ('Today', '2020-05-17', '01:11');