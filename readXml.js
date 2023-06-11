const csvWriter = require("csv-writer");
const XlsxPopulate = require("xlsx-populate");
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

  if (
    !Array.isArray(
      data["ns1:PodaciPoreskeDeklaracije"]["ns1:DeklarisaniPrihodi"][
        "ns1:PodaciOPrihodima"
      ]
    )
  ) {
    data["ns1:PodaciPoreskeDeklaracije"]["ns1:DeklarisaniPrihodi"][
      "ns1:PodaciOPrihodima"
    ] = [
      data["ns1:PodaciPoreskeDeklaracije"]["ns1:DeklarisaniPrihodi"][
        "ns1:PodaciOPrihodima"
      ],
    ];
  }
  return data["ns1:PodaciPoreskeDeklaracije"]["ns1:DeklarisaniPrihodi"][
    "ns1:PodaciOPrihodima"
  ].map((income) => ({
    imeIPrezime: `${income["ns1:Ime"]} ${income["ns1:Prezime"]}`,
    date: data["ns1:PodaciPoreskeDeklaracije"]["ns1:PodaciOPrijavi"][
      "ns1:DatumPlacanja"
    ],
    SVP: income["ns1:SVP"],
    Bruto: income["ns1:Bruto"],
    PoreskoOslobodjenje: income["ns1:Bruto"] - income["ns1:OsnovicaPorez"],
    OsnovicaPorez: income["ns1:OsnovicaPorez"],
    Porez: income["ns1:Porez"],
    OsnovicaDoprinosi: income["ns1:OsnovicaDoprinosi"],
    PIO: income["ns1:PIO"],
    ZDR: income["ns1:ZDR"],
    NEZ: income["ns1:NEZ"],
    DopTeretZaposlenog: (income["ns1:OsnovicaDoprinosi"] * 19.9) / 100,
    DopTeretPoslodavca: (income["ns1:OsnovicaDoprinosi"] * 16.15) / 100,
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
    columnStyles: {
      imeIPrezime: { width: 20 },
      SVP: { width: 15 },
      Bruto: { width: 15 },
      OsnovicaPorez: { width: 15 },
      Porez: { width: 15 },
      OsnovicaDoprinosi: { width: 15 },
      PIO: { width: 15 },
      ZDR: { width: 15 },
      NEZ: { width: 15 },
      PIOBen: { width: 15 },
    },
  });
  writer.writeRecords(data);
}

async function createExcelTable(data) {
  const fileName = data[0].imeIPrezime;
  // Creating a new workbook
  const workbook = await XlsxPopulate.fromBlankAsync();

  // Sheet selection (table)
  const sheet = workbook.sheet(0);

  // Column expansion
  sheet.column(1).width(15);
  sheet.column(2).width(15);
  sheet.column(3).width(15);
  sheet.column(4).width(15);
  sheet.column(5).width(15);
  sheet.column(6).width(15);
  sheet.column(7).width(15);
  sheet.column(8).width(20);
  sheet.column(9).width(20);
  sheet.column(10).width(20);

  // Increase height of the first row
  const firstRow = sheet.row(1).height(50);

  // Wrap text in the first row
  firstRow.style({
    wrapText: true,
    verticalAlignment: "center",
    horizontalAlignment: "center",
    bold: true,
  });
  sheet.cell("A1").style({ fill: { type: "solid", color: "D3BAD5" } });
  sheet.range("B1:J1").style({ fill: { type: "solid", color: "C6EFCE" } });
  sheet.range("A1:J1").style({ border: true });

  const startRow = 2;
  const endRow = data.length;
  sheet
    .range(`B${startRow}:J${endRow}`)
    .style({ fill: { type: "solid", color: "FFFF00" } });

  sheet
    .range(`C${endRow + 1}:I${endRow + 1}`)
    .style({ fill: { type: "solid", color: "FF0000" } });

  sheet
    .range(`A${startRow}:J${endRow + 1}`)
    .style({ border: true, borderColor: "000000", bold: true });

  // Defining table headers
  const headerRow = sheet.row(1);
  headerRow.cell(1).value(" ");
  headerRow.cell(2).value("Šifra vrste prihoda/doprinosa");
  headerRow.cell(3).value("Bruto prihod");
  headerRow.cell(4).value("Osnovica za porez");
  headerRow.cell(5).value("Porez");
  headerRow.cell(6).value("Osnovica za doprinose");
  headerRow.cell(7).value("Pio (zaposleni + poslodavac)");
  headerRow.cell(8).value("Zdravstvo (zaposleni + poslodavac)");
  headerRow.cell(9).value("Nezaposlenost (zaposleni + poslodavac)");
  headerRow.cell(10).value("PIO ben");

  // Data filling
  data.forEach((entry, index) => {
    const row = sheet.row(index + 2); // Index + 2 because the first type is the header
    row.cell(1).value(entry.date);
    row.cell(2).value(entry.SVP);
    row.cell(3).value(entry.Bruto);
    row.cell(4).value(entry.OsnovicaPorez);
    row.cell(5).value(entry.Porez);
    row.cell(6).value(entry.OsnovicaDoprinosi);
    row.cell(7).value(entry.PIO);
    row.cell(8).value(entry.ZDR);
    row.cell(9).value(entry.NEZ);
    row.cell(10).value(entry.PIOBen);
  });

  // Recording the workbook to a file

  await workbook.toFileAsync(`result/${fileName}.xlsx`);
}

module.exports = {
  readXml,
  xmlParser,
  writeCsv,
  createExcelTable,
};
