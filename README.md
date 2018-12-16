# xls-image-build-gradient
Retrieve data image in base64 from csv file, determinate his palette color and export it in a csv, with gradient.

## Tools
- [node.js](https://nodejs.org/en/)

## Dependencies

- [exceljs](https://github.com/guyonroche/exceljs)
- [lodash](https://lodash.com/docs/4.17.11)
- [node-vibrant](https://github.com/akfish/node-vibrant)
- [node-xlsx](https://github.com/mgcrea/node-xlsx)
- [png-to-jpeg](https://www.npmjs.com/package/png-to-jpeg)

## Usage



**1.** Create an excel file with
- Name Image
- Base64 Image

Example :

![ExcelImage](https://i.imgur.com/KiwBmNX.png)

----------------------------------------------------------------------------------------

**2.** Set the excel file in /assets/import/csv folder

----------------------------------------------------------------------------------------

**3.** Run `node index.js -f [namefile with extention]`

Example:

`node index.js -f image64.xlsx`

Your file with palette color linear-gradient will be generate in csv **/assets/export/csv** folder, 

aswell with your icons **/assets/export/img** 






