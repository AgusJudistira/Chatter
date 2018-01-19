function buildParameters(modus, chatKanaal, msgId, inputString) {

  var parameters = "";

  switch (modus) {
    case ("write"):
      parameters += "action=write";
      parameters += "&mykey="+chatKanaal;
      parameters += "&value="+inputString;
      break;
    case ("read"):
      parameters += "action=read";
      parameters += "&mykey="+chatKanaal;
      parameters += "&id="+msgId.toString();
      break;
    case ("list"):
      parameters += "action=list";
      parameters += "&mykey="+chatKanaal;
      break;
    default:
      alert("Verkeerde parameters bij XMLHttpRequest aanmaak");
  }

  return parameters;
}


function chatSend(realMessage) {
  var eigenNaam = document.getElementById("eigenNaam").value;
  var chatKanaal = document.getElementById("chatKanaal").value;

  if (realMessage) { // ingetypte bericht verwerken
    var inputString = eigenNaam+": "+document.getElementById("zinnetje").value;
  } else { // Dit is dan een testbericht om de laatste id op te kunnen halen en om aan te kondigen dat de gebruiker online is.
    var inputString = "Gebruiker "+eigenNaam+" is online";
  }

  var requestParameters = buildParameters("write",chatKanaal,0,inputString);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {

      msgId = parseInt(this.responseText);

      if (!realMessage) { // alleen de checker aanzetten als het aan het begin is
        chatChecker = setInterval(chatRead, 1500); // haal berichten op
      }
      else {
        //alert("Bericht "+msgId+" is verzonden");
        document.getElementById("zinnetje").value = "";
      }
      msgId--;

    }
  };

  //alert("https://www.codegorilla.nl/read_write/api.php?"+requestParameters);
  xhttp.open("GET", "https://www.codegorilla.nl/read_write/api.php?"+requestParameters, true);
  xhttp.send();
}

function chatRead() {

  var chatKanaal = document.getElementById("chatKanaal").value;

  var requestParameters = buildParameters("list", chatKanaal);
  //console.log("requestParameters in chatRead: "+requestParameters);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {
      //console.log("opgehaalde bericht: "+this.responseText+"   mykey: "+chatKanaal);
      if (this.responseText.length > 0) { // haal alleen de laatste berichten op
        chatIds = verwerkChats(this.responseText);
        //alert("chatIds.length: "+chatIds.length);
        var i = chatIds.length - 1;

        var omgekeerdeIds = new Array();
        //alert("chatIds[i]: "+chatIds[i]+"   msgId: "+msgId);
        // Van de berichten die nog niet gelezen zijn, keer ze van volgorde om
        while (chatIds[i] > msgId && i > 0 ) {
          //alert("chatIds[i]: "+chatIds[i]+"   msgId: "+msgId);
          omgekeerdeIds.push(chatIds[i--]);
        }

        //alert("omgekeerdeIds.length: "+omgekeerdeIds.length);
        // Toon ze in de volgorde dat ze verstuurd zijn.
        for (var i = 0; i < omgekeerdeIds.length; i++) {
          //alert("Getting one message with id: "+omgekeerdeIds[i]);
          getOneMessage(omgekeerdeIds[i]);
        }
      }
    }
  };
  //console.log("https://www.codegorilla.nl/read_write/api.php?"+requestParameters);
  xhttp.open("GET", "https://www.codegorilla.nl/read_write/api.php?"+requestParameters, true);
  xhttp.send();
}

function getOneMessage(reqMsgId) {

    var chatKanaal = document.getElementById("chatKanaal").value;
    var requestParameters = buildParameters("read", chatKanaal, reqMsgId);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {

        if (this.responseText.length > 0) {
          var paragraph = document.createElement("p");
          //var chatText = document.createTextNode(this.responseText);
          //paragraph.appendChild(chatText);
          paragraph.innerHTML = this.responseText;
          var chatRegion = document.getElementById("chatScreen");
          chatRegion.appendChild(paragraph);
          paragraph.scrollIntoView();

          msgId = reqMsgId ;
        }
      }
    };

    //alert("https://www.codegorilla.nl/read_write/api.php?"+requestParameters);
    xhttp.open("GET", "https://www.codegorilla.nl/read_write/api.php?"+requestParameters, true);
    xhttp.send();
}

// splits de teruggekregen string array van id's op en berg ze als getallen op in een array
function verwerkChats(rawString) {
  var strArray = rawString.split(",");
  var verwerkteMsgId = new Array();
  for (var i=0; i < strArray.length; i++) {
    verwerkteMsgId[i] = parseInt(strArray[i]);
  }
  return verwerkteMsgId;
}

function initChat() {
  clearInterval(chatChecker);
  var eigenNaam = prompt("Wat is je naam?: ", "chat naam");
  document.getElementById("eigenNaam").value = eigenNaam;
  document.getElementById("chatKanaal").value = "Chill room";

  chatSend(false); // een testbericht om te aankondigen dat de gebruiker online is en om de laatste msgId op te halen.

  var sendButton = document.getElementById("sendButton");
  sendButton.onclick = function(e) {
    e.preventDefault(); //Nodig om te voorkomen dat de standaard form submit action uitgevoerd wordt
    chatSend(true); // een echte bericht versturen
  }
}

var chatChecker;
var chatIds = new Array();

window.onload = initChat();
