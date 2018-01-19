function buildParameters(modus, myKey, msgId, inputString) {
  var parameters = "";

  if (modus == "write") {
    parameters += "action=write";
    parameters += "&mykey="+myKey;
    parameters += "&value="+inputString;
  }
  else {
    parameters += "action=read";
    parameters += "&mykey="+myKey;
    parameters += "&id="+msgId.toString();
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
    /* alert("this.readyState buiten: " + this.readyState);
    alert("this.status buiten: " + this.status); */
    if (this.readyState == 4 && this.status == 200) {
      /* alert("this.readyState binnen: "+this.readyState);
      alert("responseText: " + this.responseText); */
      msgId = parseInt(this.responseText);
      
      if (!realMessage) { // alleen de checker aanzetten als het aan het begin is
        chatChecker = setInterval(chatRead, 2000);
      }
      else {
        alert("Bericht "+msgId+" is verzonden");
        document.getElementById("zinnetje").value = "";
      }
    }
  };

  alert("https://www.codegorilla.nl/read_write/api.php?"+requestParameters);
  xhttp.open("GET", "https://www.codegorilla.nl/read_write/api.php?"+requestParameters, true);
  xhttp.send();
}

function chatRead() {
  var msgId_temp = msgId;
  //var eigenNaam = document.getElementById("eigenNaam").value;
  var chatKanaal = document.getElementById("chatKanaal").value;

  send3ReadRequests(chatKanaal, msgId_temp);
}

// vraag de volgende 3 berichten op (waarschijnlijk zijn er intussen al andere berichten door anderen ingetypt,
// daarom voor de zekerheid 3 volgende berichten)
function send3ReadRequests(chatKanaal, msgId_temp) {
  for (var i = 0; i < 3; i++) {

    var requestParameters = buildParameters("read", chatKanaal, msgId_temp + i);
    alert("requestParameters in chatRead: "+requestParameters);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      /* alert("this.readyState buiten: " + this.readyState);
      alert("this.status buiten: " + this.status); */
      if (this.readyState == 4 && this.status == 200) {

        //alert("opgehaalde bericht: "+this.responseText+"   chatKanaal: "+chatKanaal+"  bericht id: "+msgId_temp);
        if (this.responseText.length > 0) {
          var paragraph = document.createElement("p");
          var chatText = document.createTextNode(this.responseText);
          paragraph.appendChild(chatText);
          var chatRegion = document.getElementById("chatScreen");
          chatRegion.appendChild(paragraph);
          paragraph.scrollIntoView();

          if ((msgId_temp + i) > msgId) { // vorige msgId is niet meer de nieuwste
            msgId = msgId_temp + i; // werk hoogste msgId bij
            alert("nieuwe msgId wordt: "+msgId);
          }
        }
      }
    };

    alert("https://www.codegorilla.nl/read_write/api.php?"+requestParameters);
    xhttp.open("GET", "https://www.codegorilla.nl/read_write/api.php?"+requestParameters, true);
    xhttp.send();
  }
}

function initChat() {
  clearInterval(chatChecker);
  var eigenNaam = prompt("Wat is je naam?: ", "chat naam");
  document.getElementById("eigenNaam").value = eigenNaam;
  document.getElementById("chatKanaal").value = "Chill room";

  chatSend(false); // een testbericht om te aankondigen dat de gebruiker online is en om de laatste msgId op te halen.
  //alert("msgId in initChat: "+msgId);
  //chatChecker = setInterval(chatRead, 3000);

  var sendButton = document.getElementById("sendButton");
  sendButton.onclick = function(e) {
    e.preventDefault(); //Nodig om te voorkomen dat de standaard form submit action uitgevoerd wordt
    chatSend(true); // een echte bericht versturen
  }
}

var chatChecker;

window.onload = initChat();
