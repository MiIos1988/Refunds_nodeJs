const fs = require("fs");
const path = require("path");
const { readXml, xmlParser, createExcelTable } = require("./readXml");

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

    for (const key of Object.keys(perUser)) {
      perUser[key].push(
        perUser[key].reduce(
          (acc, curr) => {
            acc.Bruto += Number(curr.Bruto);
            acc.PoreskoOslobodjenje += Number(curr.PoreskoOslobodjenje);
            acc.OsnovicaPorez += Number(curr.OsnovicaPorez);
            acc.Porez += Number(curr.Porez);
            acc.OsnovicaDoprinosi += Number(curr.OsnovicaDoprinosi);
            acc.PIO += Number(curr.PIO);
            acc.ZDR += Number(curr.ZDR);
            acc.NEZ += Number(curr.NEZ);
            acc.DopTeretZaposlenog += Number(curr.DopTeretZaposlenog);
            acc.DopTeretPoslodavca += Number(curr.DopTeretPoslodavca);
            return acc;
          },
          {
            Bruto: 0,
            PoreskoOslobodjenje: 0,
            OsnovicaPorez: 0,
            Porez: 0,
            OsnovicaDoprinosi: 0,
            PIO: 0,
            ZDR: 0,
            NEZ: 0,
            DopTeretZaposlenog: 0,
            DopTeretPoslodavca: 0,
          }
        )
      );
    }

    Promise.all(
      Object.keys(perUser).map((userName) => {
        createExcelTable(perUser[userName]);
      })
    );
  } catch (err) {
    console.log(err);
  }
};

prepareRefunds();
