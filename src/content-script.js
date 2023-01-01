console.log("this is content-script");

var currentChatItem = null;
var RESP_BOX_ID = "respBox861029s";
var selectionStores = {};
var respLayer = document.createElement("response-layer");
respLayer.style.zIndex="99999999";
var respBox = document.createElement("div");
respBox.id = RESP_BOX_ID;
respBox.style.width = "800px";
//respBox.style.height = "200px";
respBox.style.position = "absolute";
respBox.style.fontSize = "16px";
respBox.style.left = "0px";
respBox.style.top = "0px";
respBox.style.background = "#FFF";
respBox.style.border = "1px solid #dee2e5";
respBox.style.borderRadius = "5px";
respBox.style.boxShadow = "0px 2px 16px rgb(0 0 0 / 16%)";
respBox.style.zIndex="99999999";
respLayer.appendChild(respBox);

function generateChatElement(logo, gray, content){
    var chatElement = document.createElement("div");
    var chatLogo = document.createElement("div");
    var chatContent = document.createElement("div");
    chatLogo.style.width = "30px";
    chatLogo.style.height = "30px";
    chatLogo.style.background = "#AAA";
    chatLogo.style.borderRadius = "2px";
    chatLogo.style.margin = "0px 20px 0px 20px";
    chatLogo.style.position = "absolute";
    chatElement.style.paddingBottom = "24px";
    chatElement.style.paddingTop = "24px";
    if(content){
       chatContent.innerText = content;
    }else{
       chatContent.innerHTML = "&nbsp;";
    }
    chatContent.style.color = "rgb(52,53,65)";
    chatContent.style.margin = "0px 20px 0px 70px";
    chatContent.className = "chat-content";
    if(gray){
       chatElement.style.backgroundColor = "#f6f6f7";
    }
    chatElement.style.borderBottom = "1px solid #ddd";
    chatElement.appendChild(chatLogo);
    chatElement.appendChild(chatContent);
    return chatElement;
}


function layerDisplay(inputText){
    console.log("try to enable response-layer");
    var layer = document.querySelector("response-layer");
    if(layer == null){
        document.getElementsByTagName("html")[0].appendChild(respLayer);
        layer = respLayer;
    }
    var position = window.getSelection().getRangeAt(0).getBoundingClientRect();
    console.log(position);
    respBox.style.top = (window.scrollY + position.top + position.height + 5) + "px";
    respBox.style.left = position.left + "px";
    respBox.style.display = "block";
    
    respBox.appendChild(generateChatElement(null, false, inputText));
    currentChatItem = generateChatElement(null, true, null);
    respBox.appendChild(currentChatItem);
   
 
}

function layerHide(){
    respBox.style.display = "none";
    respBox.innerHTML = "";
    currentChatItem = null;
}

document.addEventListener("click", function(event){
     if(event.target == respBox || respBox.contains(event.target)){
         // click in respBox    
     }else{
         layerHide();
     }
 
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "openPrompt") {
       //var selectionObject = window.getSelection();
       //console.log(request.clickInfo.selectionText);
       selectionStores[request.selectionData.id] = {   
         // "object": selectionObject,
          //"data": request.selectionData
       };
       layerDisplay(request.inputText);
    }else if (request.method == "receivePrompt") {
       //console.log(request);
       //console.log(request.data.message.content.parts[0]);
       if(currentChatItem != null){
           currentChatItem.getElementsByClassName("chat-content")[0].innerHTML = request.html;
       }
    }else if(request.method == "loginWarning") {
       currentChatItem.getElementsByClassName("chat-content")[0].innerHTML = "Your login status is invalid. Please <a href='https://chat.openai.com/' target='_blank'>Login</a> again.";
       console.log("login!");
    }

})


