const fs = require("fs");
const path = require("path");
const { readXml, xmlParser, writeCsv } = require("./readXml");

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
    Promise.all(Object.keys(perUser).map(userName => {
      writeCsv(perUser[userName])
    }))

    console.log(perUser);
  } catch (err) {
    console.log(err);
  }
};

prepareRefunds();
