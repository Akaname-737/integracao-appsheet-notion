function createKML(data) {
  const kmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const kmlDocument = '<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n';
  const kmlFooter = '</Document>\n</kml>';

  var kmlContent;

  for (let i = 1; i <data.length; i++) {
    const row = data[i];
    const inconUrl = createIcon(row, 27);

    kmlContent += `
    <Style id="icon-${i}-normal">
    <IconStyle>
      <scale>1</scale>
      <Icon>
        <href>${inconUrl}</href>
      </Icon>
    </IconStyle>
    <LabelStyle>
      <scale>0</scale>
    </LabelStyle>
  </Style>
  <Style id="icon-${i}-highlight">
    <IconStyle>
      <scale>1</scale>
      <Icon>
        <href>${inconUrl}</href>
      </Icon>
    </IconStyle>
  </Style>`;
  }


  // Adiciona estilos com a cor e o ícone desejados
  kmlContent += '<Folder>\n<name>Emissoras</name>\n';

  // Adiciona cada rádio como ponto na camada de pontos
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = row[8]; // Emissora
    const longitude = parseFloat(row[2]); // Longitude na coluna 2
    const latitude = parseFloat(row[3]); // Latitude na coluna 3
    const region = row[4]; // Região na coluna 4
    const uf = row[6]; // UF na coluna 6
    const praca = row[7]; // Praça na coluna 7
    const dial = row[9]; // Dial na coluna 9

    // Cria a URL da imagem usando a função CONCATENATE
    const imageUrl = createImage(row, 27);

    kmlContent += 
      `<Placemark>
        <name>${name}</name>
        <styleUrl>#icon-${i}-normal</styleUrl>
        <description><![CDATA[
          <img src="${imageUrl}" width="200" height="150"/><br/>
          Região: ${region}<br/>
          UF: ${uf}<br/>
          Praça: ${praca}<br/>
          Dial: ${dial}<br/>
        ]]></description>
        <Point>
          <coordinates>${longitude},${latitude}</coordinates>
        </Point>
      </Placemark>`;
  }

  kmlContent += '</Folder>\n'; // Fecha a camada de pontos

  // Inicia a camada para os círculos de cobertura (raios)
  kmlContent += '<Folder>\n<name>Projeção de cobertura</name>\n';
  const largestRadiusByCity = {};

  // Primeira passagem: calcula o maior raio para cada cidade
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const radius = parseFloat(row[1]) * 1.5; // Aumenta o raio em 50%
    const city = row[7]; // Nome da cidade na coluna 7
    
    // Guarda o maior raio para cada cidade
    if (!largestRadiusByCity[city] || radius > largestRadiusByCity[city].radius) {
      largestRadiusByCity[city] = { latitude: parseFloat(row[3]), longitude: parseFloat(row[2]), radius: radius };
    }
  }

  // Segunda passagem: adiciona ao KML apenas o maior círculo para cada cidade
  for (const city in largestRadiusByCity) {
    const circle = largestRadiusByCity[city];
    kmlContent += 
      `<Placemark>
        <name>${city}</name>
        ${createCircleCoordinates(circle.latitude, circle.longitude, circle.radius)}
      </Placemark>`;
  }

  kmlContent += '</Folder>\n'; // Fecha a camada de cobertura

  // Combina todos os segmentos do KML
  const kmlOutput = kmlHeader + kmlDocument + kmlContent + kmlFooter;

  // Salva ou exibe o KML como desejar
  Logger.log(kmlOutput);

  // Salva o arquivo KML no Google Drive e envia por e-mail
  const kmlFileName = 'Rádios.kml';
  const folder = DriveApp.getRootFolder();
  const file = folder.createFile(kmlFileName, kmlOutput, MimeType.PLAIN_TEXT);

  Logger.log(`Arquivo KML criado: ${file.getUrl()}`);

  // Obtém o e-mail do usuário que ativou o gatilho (coluna 26)
  const emailAddress = data[1][26];

  const subject = 'Arquivo KML de Rádios';
  const body = 
  `Olá,

  Segue em anexo o arquivo KML contendo os dados das emissoras e seus círculos de cobertura.

  Para utilizar o arquivo KML, siga estas etapas:

  1. Baixe o arquivo KML em anexo.
  2. Acesse o Google My Maps pelo link: https://www.google.com/maps/d/u/0/.
  3. Clique na opção "Criar um novo mapa".
  4. No novo mapa, procure a opção "Importar" e selecione o arquivo KML que você baixou.

  Atenciosamente,`;

  MailApp.sendEmail({
    to: emailAddress,
    subject: subject,
    body: body,
    attachments: [file]
  });

  Logger.log('Arquivo KML enviado por e-mail com sucesso.');
  Logger.log(`Endereço enviado: ${emailAddress}`);

  
  // Criar um Blob para o KML
  // const kmlBlob = Utilities.newBlob(kmlOutput, 'application/vnd.google-earth.kml+xml', 'Rádios.kml');

  // Configurar resposta de Download
  // return ContentService.createTextOutput(kmlBlob.getDataAsString()).setMimeType(ContentService.MimeType.OCTET_STREM).downloadAsFile(kmlBlob.getName());
}


// Função para criar as coordenadas do círculo
function createCircleCoordinates(lat, lng, radius) {
  const coords = [];
  const earthRadius = 6371000; // Raio da Terra em metros
  const numPoints = 36; // Número de pontos a serem gerados para o círculo

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);

    // Converte os deslocamentos em latitude e longitude
    const newLat = lat + (dy / earthRadius) * (180 / Math.PI);
    const newLng = lng + (dx / (earthRadius * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI);
    
    coords.push(`${newLng},${newLat}`);
  }

  return `<Polygon>
    <outerBoundaryIs>
      <LinearRing>
        <coordinates>${coords.join(' ')}</coordinates>
      </LinearRing>
    </outerBoundaryIs>
  </Polygon>`;
}
