const fs = require("fs");
const path = require("path");
const { readXml, xmlParser, writeCsv, createExcelTable } = require("./readXml");


const prepareRefunds = async () => {
  try {
    const allFiles = await fs.promises.readdir(
      path.join(__dirname, "initialData")
    );
    const xmlFiles = allFiles.filter((el) => {
      return el.endsWith("xml");
    });
    const xmlData = await readXml(xmlFiles);
    const parsedData = xmlData.map(xmlParser);
    const perUser = parsedData.reduce((acc, curr) => {
      curr.forEach((element) => {
        if (acc[element.imeIPrezime]) {
          acc[element.imeIPrezime].push(element);
        } else {
          acc[element.imeIPrezime] = [element];
        }
      });

      return acc;
    }, {});
    // console.log(perUser);
    for (const key of Object.keys(perUser)) {
     perUser[key].push(perUser[key].reduce((acc, curr) => {
      acc.Bruto += Number(curr.Bruto);
      return acc;
     },{Bruto: 0}))
    }
    // Promise.all(Object.keys(perUser).map(userName => {
    //   writeCsv(perUser[userName])
    // }))

    Promise.all(Object.keys(perUser).map(userName => {
      createExcelTable(perUser[userName])
    }))

    // console.log(perUser);
  } catch (err) {
    console.log(err);
  }
};

prepareRefunds();
