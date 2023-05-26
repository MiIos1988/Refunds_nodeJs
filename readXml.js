const csvWriter = require("csv-writer");
const { XMLParser } = require("fast-xml-parser");
const fs = require("fs");
const path = require("path");

function readXml(files) {
  return Promise.all(
    files.map((file) => {
      return fs.promises.readFile(
        path.join(__dirname, "initialData", file),
        "utf8"
      );
    })
  );
}

function xmlParser(xmlFileData) {
  const parser = new XMLParser();
  const data = parser.parse(xmlFileData);
  return data["tns:PodaciPoreskeDeklaracije"]["tns:DeklarisaniPrihodi"][
    "tns:PodaciOPrihodima"
  ].map((income) => ({
    imeIPrezime: income["tns:Ime"] + " " + income["tns:Prezime"],
    SVP: income["tns:SVP"],
    Bruto: income["tns:Bruto"],
    OsnovicaPorez: income["tns:OsnovicaPorez"],
    Porez: income["tns:Porez"],
    OsnovicaDoprinosi: income["tns:OsnovicaDoprinosi"],
    PIO: income["tns:PIO"],
    ZDR: income["tns:ZDR"],
    NEZ: income["tns:NEZ"],
    PIOBen: income["tns:PIOBen"],
  }));
}

function writeCsv(data) {
  const fileName = data[0].imeIPrezime;
  const writer = csvWriter.createObjectCsvWriter({
    path: path.resolve(__dirname, "result", `${fileName}.csv`),
    header: [
      { id: "imeIPrezime", title: "Ime i prezime" },
      { id: "SVP", title: "SVP" },
      { id: "Bruto", title: "Bruto" },
      { id: "OsnovicaPorez", title: "OsnovicaPorez" },
    ],
  });
  writer.writeRecords(data).then(() => {
    console.log("Done!");
  });
}

module.exports = {
  readXml,
  xmlParser,
  writeCsv,
};
