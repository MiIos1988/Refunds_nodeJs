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

  return data["ns1:PodaciPoreskeDeklaracije"]["ns1:DeklarisaniPrihodi"][
    "ns1:PodaciOPrihodima"
  ].map((income) => ({
    imeIPrezime: `${income["ns1:Ime"]} ${income["ns1:Prezime"]}`,
    SVP: income["ns1:SVP"],
    Bruto: income["ns1:Bruto"],
    OsnovicaPorez: income["ns1:OsnovicaPorez"],
    Porez: income["ns1:Porez"],
    OsnovicaDoprinosi: income["ns1:OsnovicaDoprinosi"],
    PIO: income["ns1:PIO"],
    ZDR: income["ns1:ZDR"],
    NEZ: income["ns1:NEZ"],
    PIOBen: income["ns1:PIOBen"],
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
      { id: "Porez", title: "Porez" },
      { id: "OsnovicaDoprinosi", title: "OsnovicaDoprinosi" },
      { id: "PIO", title: "PIO" },
      { id: "ZDR", title: "ZDR" },
      { id: "NEZ", title: "NEZ" },
      { id: "PIOBen", title: "PIOBen" },
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
