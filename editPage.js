function updatePageNameAndIcon(pageId, values, token) {
  const url = `https://api.notion.com/v1/pages/${pageId}`;

  const newName = `${removeEspacosExtras(values[34])} (${dateTimeFunction()})`; 
  const clientUrl = values [32];

  const icon = createPageIcon(clientUrl)
  Logger.log(icon);
  Logger.log(newName);
  
  const options = {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": '2022-06-28',
    },
    payload: JSON.stringify({
      properties: {
        title: [
          {
            text: {
              content: newName,
            },
          },
        ],
      },
      icon: {
        type: "external", // Use "external" para uma URL de ícone
        external: {url: icon}, // Ou, se "type: external", use { url: "URL_DO_ICONE" }
      },
    }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (statusCode === 200) {
    Logger.log("Página atualizada com sucesso!");
  } else {
    // Detalhes do erro para ajudar na depuração
    Logger.log(`Erro ao atualizar a página: Código ${statusCode}`);
    Logger.log(`Resposta do servidor: ${responseBody}`);
    throw new Error(`Erro ao atualizar a página: ${responseBody}`);
  }
}

