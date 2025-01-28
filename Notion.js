
function clearNotionDatabase(token, databaseId) {
  const queryUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  try {
    // 1. Obter todas as páginas da base
    const queryResponse = UrlFetchApp.fetch(queryUrl, {
      method: 'post',
      headers: headers,
      payload: JSON.stringify({})
    });

    const pages = JSON.parse(queryResponse.getContentText()).results;

    // 2. Iterar sobre as páginas e deletá-las
    pages.forEach(page => {
      const pageId = page.id;

      // Deletar a página
      const deleteResponse = UrlFetchApp.fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'patch',
        headers: headers,
        payload: JSON.stringify({ archived: true })
      });

      Logger.log(`Página ${pageId} arquivada. Resposta: ${deleteResponse.getContentText()}`);
    });

    Logger.log(`Base de dados ${databaseId} limpa com sucesso.`);
  } catch (error) {
    Logger.log(`Erro ao limpar a base de dados: ${error}`);
  }
}


function exportDataToNotion(data, token, databaseId, url) {
  const link = url;
  if (data[1][33] == "Mídia Avulsa") {
    for (let i = 1; i <data.length; i++) {
      const row = data[i];
      sendRowToNotionSingleMedia(row, token, databaseId, link, row[31]);
    }
  } else if (data[1][33] == "Patrocínio") {
    for (let i = 1; i <data.length; i++) {
      const row = data[i];
      sendRowToNotionSponsorship(row, token, databaseId, link, row[31]);
    }
  }
}

function sendRowToNotionSingleMedia(row, token, databaseId, url, coverPath) {
  const iconUrl = createImage(row, 27);
  let coverUrl;
  
  if (coverPath) {
    coverUrl = createImage(row, 31)
  } else {
    Logger.log('coverPath indefinido ou vazio. Ícone Utilizado');
    coverUrl = iconUrl;
  }
  
  const notionPayload = {
    parent: { database_id: databaseId },
    cover: { type: "external", external: { url: coverUrl } },
    icon: { type: "external", external: { url: iconUrl } },
    properties: {
      "ID": propertieRichText(row, 0),
      "Região": propertieSelect(row, 4),
      "Mesorregião": propertieRichText(row, 5),
      "UF": propertieRichText(row, 6),
      "Praça": propertieRichText(row, 7),
      "Emissora": propertieTittle(row, 8),
      "Dial": propertieRichText(row, 9),
      "Estilo musical":  propertieMultiSelect(row, 10),
      "Gênero": propertieRichTextAndAnnotation(row, 11, "pink"), // Negrito e rosa
      "Classe": propertieRichTextAndAnnotation(row, 12, "yellow"), // Negrito e amarelo 
      "Idade": propertieRichTextAndAnnotation(row, 13, "blue"), // Negrito e azul 
      "Universo": propertieNumber(row, 14),
      "Caixa comercial": propertieRichTextCaixaComercial(row, 15),
      "PMM": propertieNumber(row, 16),
      "Spots 30": propertieNumber(row, 17),
      "Valor Spot (Tabela)": propertieNumber(row, 18),
      "Valor Spot (Negociado)": propertieNumber(row, 19),
      "Test. 60": propertieNumber(row, 20),
      "Valor Test (Tabela)": propertieNumber(row, 21),
      "Valor Test (Negociado)": propertieNumber(row, 22),
      "Cachê": propertieNumber(row, 23),
      "Comentários": propertieRichText(row, 24),
      "Classificação": propertieNumber(row, 25)
    }
  };

  const options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify(notionPayload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    const pageId = responseData.id; // Pegue o ID da página criada
    const urlApi = `https://api.notion.com/v1/blocks/${pageId}/children`;

    addFileToNotionPage(urlApi,row[28], token);
    addLinkToPageContent(token, urlApi, row, 'row[29]');
    addLinkToPageContent(token, urlApi, row, 'row[30]');
    addLinkToNotionPage(urlApi, row, 35, token);

    Logger.log("Resposta do Notion: " + response.getContentText());
  } catch (error) {
    Logger.log("Erro ao enviar dados para o Notion: " + error);
  }
}


function sendRowToNotionSponsorship(row, token, databaseId, url, coverPath) {
  const iconUrl = createImage(row, 27);
  let coverUrl;
  
  if (coverPath) {
    coverUrl = createImage(row, 31)
  } else {
    Logger.log('coverPath indefinido ou vazio. Ícone Utilizado');
    coverUrl = iconUrl;
  }
  
  const notionPayload = {
    parent: { database_id: databaseId },
    cover: { type: "external", external: { url: coverUrl } },
    icon: { type: "external", external: { url: iconUrl } },
    properties: {
      "ID": propertieRichText(row, 0),
      "Região": propertieSelect(row, 4),
      "Mesorregião": propertieRichText(row, 5),
      "UF": propertieRichText(row, 6),
      "Praça": propertieRichText(row, 7),
      "Emissora": propertieTittle(row, 8),
      "Dial": propertieRichText(row, 9),
      "Estilo musical": propertieMultiSelect(row, 10),
      "Gênero": propertieRichTextAndAnnotation(row, 11, "pink"), // Negrito e rosa
      "Classe": propertieRichTextAndAnnotation(row, 12, "yellow"), // Negrito e amarelo 
      "Idade": propertieRichTextAndAnnotation(row, 13, "blue"), // Negrito e azul 
      "Universo": propertieNumber(row, 14),
      "Caixa comercial": {"rich_text": [{"text": {"content": `${row[15]} min`}}]},
      "PMM": propertieNumber(row, 16),
      "Cachê": propertieNumber(row, 23),
      "Comentários": propertieRichText(row, 24),
      "Classificação":propertieNumber(row, 25)
    }
  };

  const options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify(notionPayload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    const pageId = responseData.id; // Pegue o ID da página criada
    const urlApi = `https://api.notion.com/v1/blocks/${pageId}/children`;

    addFileToNotionPage(urlApi,row[28], token);
    addLinkToPageContent(token, urlApi, row, 'row[29]');
    addLinkToPageContent(token, urlApi, row, 'row[30]');
    addLinkToNotionPage(urlApi, row, 35, token);

    Logger.log("Resposta do Notion: " + response.getContentText());
  } catch (error) {
    Logger.log("Erro ao enviar dados para o Notion: " + error);
  }
}


function addFileToNotionPage(urlApi,filePath, token) {

  const fileName = filePath.split('/').pop();
  const fileId = getFileIdByName(fileName);

  if (fileId) {
    Logger.log(`Arquivo encontrado: ${fileName}\nfileId: ${fileId}`);

    const driveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drive_link`;

    // Estrutura para adicionar múltiplos blocos
   const blocksPayload = {
      children: [{
        type: "callout", callout: { // Usando um bloco de callout
          icon: {
            type: "emoji",
            emoji: "🖇️" // Usando emoji de documento como ícone
          },
          rich_text: [{
            type: "text",text: {
              content: "MIDIA KIT", // Este texto será o destaque do callout
            },
            annotations: {
              bold: true // Aplica negrito ao texto
            }
          }],
          // Adicionando o arquivo dentro do callout
          children: [{
            type: "file", file: { // Bloco de arquivo
              external: {
                url: driveUrl // URL do arquivo a ser adicionado
              },
              name: "Mídia Kit" // Nome do arquivo como "Mídia Kit"
            }
          }],
        }
      }]
    };

    const options = {
      method: "patch",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      payload: JSON.stringify(blocksPayload),
      muteHttpExceptions: true // Para capturar erros de requisição
    };

    try {
      const response = UrlFetchApp.fetch(urlApi, options);
      Logger.log("Blocos adicionados na página: " + response.getContentText());
    } catch (error) {
      Logger.log("Erro ao adicionar blocos à página no Notion: " + error);
    }
  } else {
    Logger.log("Arquivo não encontrado: " + fileName);
  }
}

// criar duas funções separadas para facebook e instagram
function addLinkToPageContent(token, urlApi, row, column) {
  var socialMediaLink;
  var urlIcon;
  var media;
  var path;

  if (column == 'row[30]') {
    socialMediaLink = 'https://www.instagram.com/';
    media = 'Instagram';
    urlIcon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png';
    path = row[30];
  } else if (column == 'row[29]') {
    socialMediaLink = 'https://www.facebook.com/';
    media = 'Facebook';
    urlIcon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Facebook_icon_2013.svg/2048px-Facebook_icon_2013.svg.png';
    path = row[29];
  }

  const socialMediaParametro = processSocialMediaLink(path, row);
  
  socialMediaLink += socialMediaParametro;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  // Definindo o conteúdo do link a ser inserido no corpo da página
  const payload = {
    'children': [
      {
        'object': 'block',
        'type': 'callout',
        'callout': {
          'icon': {
            'type': 'external',
            'external': {
              'url': urlIcon
            }
          },
          'rich_text': [
            {
              'type': 'text',
              'text': {
                'content': `${media} | Rádio ${row[8]} - ${row[9]}`,
                'link': {
                  'url': `${socialMediaLink}`
                }
              },
              'annotations': {
                'bold': true
              }
            }
          ]
        }
      },
    ]
  };
  

  if (payload) {
    const options = {
      'method': 'PATCH',
      'headers': headers,
      'payload': JSON.stringify(payload)
    };

    try {
      const response = UrlFetchApp.fetch(urlApi, options);
      const data = JSON.parse(response.getContentText());

      if (data) {
        Logger.log('Link adicionado ao corpo da página com sucesso');
      } else {
        Logger.log('Erro ao adicionar o link ao corpo da página');
      }
    } catch (error) {
      Logger.log(`${socialMediaParametro} \n${socialMediaLink} \nErro: ${error}`);
    }
  } else {
    Logger.log('Payload não foi definido. Verifique as condições.');
  }
}


function addLinkToNotionPage(urlApi, row, index, token) {
  const radioLink = row[index];

  if (radioLink.length > 0) {
    Logger.log(`Link Rádio ao Vivo encontrado: ${radioLink}`);

    // Estrutura para adicionar múltiplos blocos
    const blocksPayload = {
      children: [{
        object: "block",
        type: "embed",
        embed: {
          url: radioLink
        }
      }]
    };

    const options = {
      method: "patch",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      payload: JSON.stringify(blocksPayload),
      muteHttpExceptions: true // Para capturar erros de requisição
    };

    try {
      const response = UrlFetchApp.fetch(urlApi, options);
      Logger.log("Blocos adicionados na página: " + response.getContentText());
    } catch (error) {
      Logger.log("Erro ao adicionar blocos à página no Notion: " + error);
    }
  } else {
    Logger.log("Link Rádio ao Vivo não encontrado: " + radioLink);
  }
}
