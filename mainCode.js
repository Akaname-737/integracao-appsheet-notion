// Dados para o primeiro banco de dados do Notion
const NOTION_TOKEN_1 = 'ntn_o8780029173a52Sft84cp1WmcIWZUyiGkuZuBVYqmJg8gx';
let NOTION_DATABASE_ID_1;
let NOTION_PAGE_ID_1;

const notionUrl = 'https://api.notion.com/v1/pages'

const fileId = "1qOq4CfEo_8u_hVvjfwc6SEVx_I7633ev"; // ID do arquivo .xlsx que se atualiza automaticamente
const destinationSheetId = "1PVCZffGKfni52DCYqVt4WMpSD8QdiZJooTE0BHuGrGc"; // ID da planilha Google Sheets de destino

const blob = DriveApp.getFileById(fileId).getBlob(); // Obtém o arquivo .xlsx como Blob

const tempFile = Drive.Files.insert({
  title: "TemporaryImport",
  mimeType: MimeType.GOOGLE_SHEETS
}, blob); // Converte o Blob para uma planilha Google Sheets usando Drive API

const destSpreadsheet = SpreadsheetApp.openById(destinationSheetId); // Abre a planilha de destino
const destSheet = destSpreadsheet.getSheets()[0];

const values = SpreadsheetApp.openById(tempFile.id).getSheets()[0].getDataRange().getValues(); // Abre o arquivo como uma planilha e Copia os dados da planilha temporária para a de destino



function importXLSXDataToGoogleSheetsAndExportToNotion() {
  
  createKML(values); // Cria o arquivo KML com os dados importados

  if (values[1][33] == "Mídia Avulsa") {
    NOTION_DATABASE_ID_1 = '12a20b549cf5802c870fe5abfe9e79c3';
    NOTION_PAGE_ID_1 = '13c20b549cf580d9b6f9db45cc07d2c5';
  } else if (values[1][33] == "Patrocínio") {
    NOTION_DATABASE_ID_1 = '17a20b549cf58149852fd434e8b61575';
    NOTION_PAGE_ID_1 = '17a20b549cf5809ba7c1d61e288844dd';
  } else {
    NOTION_DATABASE_ID_1 = '12a20b549cf5802c870fe5abfe9e79c3';
    NOTION_PAGE_ID_1 = '13c20b549cf580d9b6f9db45cc07d2c5';
  }

  updatePageNameAndIcon(NOTION_PAGE_ID_1, values[1], NOTION_TOKEN_1); // Altera Nome e Ícone da Página Modelo

  clearNotionDatabase(NOTION_TOKEN_1, NOTION_DATABASE_ID_1); // Limpa os dados existentes nos dois bancos de dados do Notion
  
  updateDestSheet(); // Atualiza a Planilha Google

  DriveApp.getFileById(tempFile.id).setTrashed(true);// Remove o arquivo temporário
  Logger.log("Dados importados com sucesso para a planilha Google Sheets!");

  exportDataToNotion(values, NOTION_TOKEN_1, NOTION_DATABASE_ID_1, notionUrl); // Exporta os dados importados para os dois bancos de dados do Notion
}


function updateDestSheet() {
  destSheet.clear(); // Limpa dados na planilha de destino

  destSheet.getRange(1, 1, values.length, values[0].length).setValues(values); // Insere os novos dados na planilha de destino
  
  destSheet.getRange(1, 1, destSheet.getLastRow(), destSheet.getLastColumn()).setNumberFormat('@'); // Formata todas as colunas da planilha de destino para texto simples ('@')
}


function createMap () {
  updateDestSheet();

  createKML(values);
}
