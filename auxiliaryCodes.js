
function createImage(row, index) {
  return `https://www.appsheet.com/image/getimageurl?appName=E-R%C3%A1dios-408183446-24-03-22-2&tableName=R%C3%A1dios&fileName=${encodeURIComponent(row[index])}&appVersion=1.001647&signature=55a416bea288a1c89f4ccbd3743fec09a21dd64c8b50d89b1468ea006e48a665`;
}

function createCover(row, index) {
 return `https://www.appsheet.com/image/getimageurl?appName=E-R%C3%A1dios-408183446-24-03-22-2&tableName=R%C3%A1dios&fileName=${encodeURIComponent(row[index])}&appVersion=1.001738`
}

function createPageIcon(row) {
   const [prefix, filePath] = row.split("::");

  return `https://www.appsheet.com/image/getimageurl?appName=E-R%C3%A1dios-408183446-24-03-22-2&tableName=Clientes&fileName=${encodeURIComponent(filePath)}&appVersion=1.001749&`;
}

function createIcon(row, index) {
  var link = "https://www.appsheet.com/image/getimageurl?appName=E-R%C3%A1dios-408183446-24-03-22-2" + "&tableName=R%C3%A1dios" + "&fileName=" + encodeURIComponent(row[index]) + "&appVersion=1.001647" + "&signature=55a416bea288a1c89f4ccbd3743fec09a21dd64c8b50d89b1468ea006e48a665";
  return link
    .replace(/&/g, "&amp;") // Escapa "&"
    .replace(/</g, "&lt;")  // Escapa "<"
    .replace(/>/g, "&gt;")  // Escapa ">"
    .replace(/"/g, "&quot;") // Escapa aspas duplas
    .replace(/'/g, "&apos;"); // Escapa aspas simples
}



// Função para obter o ID do arquivo pelo nome
function getFileIdByName(fileName) {
  const files = DriveApp.getFilesByName(fileName); // Usar getFilesByName para uma pesquisa simplificada
  
  if (files.hasNext()) {
    const file = files.next();
    return file.getId(); // Retorna o ID do arquivo encontrado
  }
  return null; // Retorna null se não encontrar um arquivo com esse nome
}



function removeEspacosExtras(str) {
  if (!str || typeof str !== 'string') {
    return ''; // Retorna uma string vazia se o valor não for válido
  }
  // Remove espaços extras e espaços no início e fim
  return str.replace(/\s+/g, ' ').trim();
}



function dateTimeFunction() {
  var currentDate = new Date(); 

  let day = currentDate.getDate();
  if (day < 10) {
    day = "0" + currentDate.getDate(); 
  }

  let month = currentDate.getMonth()+1;
  if (month < 10) {
    month = "0" + (currentDate.getMonth() + 1); 
  }

  let hour = currentDate.getHours();
  if (hour < 10) {
    hour = "0" + currentDate.getHours(); 
  }

  let minutes = currentDate.getMinutes();
  if (minutes < 10) {
    minutes = "0" + currentDate.getMinutes(); 
  }

  var dateTime = day + "/"
                + month + " - "  
                + hour + ":"  
                + minutes;

  Logger.log(dateTime);
  return dateTime;
}



function processSocialMediaLink(url, row) {
  try {
    
    let cleanUrl = url.replace(/^https?:\/\//, ''); // Se o URL começar com "http://" ou "https://", removemos o protocolo

    if (cleanUrl.includes("instagram") || cleanUrl.includes("facebook")) { // Se o URL contiver "instagram" ou "facebook", vamos processá-lo
      
      let regex = /(?:www\.)?(?:facebook|instagram)\.com\/([^\/?]+)/; // Remover o domínio e o caminho (após a primeira barra "/") e qualquer parâmetro de query
      let match = cleanUrl.match(regex);

      if (match && match[1]) { // Exibe o identificador
        return match[1]; // Retorna o identificador (antes da primeira barra ou parâmetro)
      }
    } else {// Caso não contenha "facebook" ou "instagram", apenas extraímos o primeiro segmento
      
      
      let pathRegex = /^([^\/?]+)/; // Remove qualquer parte da URL após a primeira barra "/" e captura tudo antes de qualquer "/"
      let match = cleanUrl.match(pathRegex);

      if (match && match[1]) { // Exibe o identificador
        return match[1]; // Retorna o identificador
      }
    }

    // Caso o URL não tenha barras ou parâmetros
    if (cleanUrl) { // Exibe o identificador sem alterações
      return cleanUrl;
    }

    
    Logger.log(`Rádio ${row[7]} ${row[8]}: URL inválido ou não encontrado.`); // Caso o URL seja vazio ou inválido
    return null;
  } catch (error) {
    Logger.log("Erro: " + error);
    return null; // Retorna null em caso de erro
  }
}



function propertieSelect(row, index) {
  return {
    "select": {
      "name": String(row[index]) || null
    }
  };
}

function propertieRichTextCaixaComercial(row, index) {
  if (row[index] <= 0 || row[index] == null) {
    return {
      "rich_text": [{
        "text": {
          "content": ""
        }
      }]
    };
  } else{
    return {
      "rich_text": [{
        "text": {
          "content": `${row[index]} min`
        }
      }]
    };
  }
}


function propertieTittle(row, index) {
  return {
    "title": [{
      "text": {
        "content": String(row[index])
      }
    }]
  };
}


function propertieNumber(row, index) {
  return {
    "number": row[index] ? Number(row[index]) : null
  };
}


function propertieRichText(row, index) {
  return {
    "rich_text": [{
      "text": {
        "content": String(row[index])
      }
    }]
  };
}

function propertieRichTextAndAnnotation(row, index, cor) {
  return {
    "rich_text": [{
      "text": {
      "content": String(row[index])
      },
      "annotations": {
        "bold": true,
        "color": cor
      }
    }]
  };
}

function propertieMultiSelect(row, index) {
    if (!row[index] || String(row[index]).trim() === "") {
        Logger.log("Campo Estilo musical vazio ou inválido. Retornando multi_select vazio.");
        return { "multi_select": [] };
    }
    const values = String(row[index]).split(',').map(item => item.trim());
    Logger.log("Valores Multi-select processados: " + values);
    return { "multi_select": values.map(value => ({ "name": value })) };
}

