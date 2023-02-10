/// <reference types="chrome"/>

// let apiRoutes:{[key:string]:any} = {};

// function getRouteKey(uri:string, method:string):string {
//   return uri + "#" + method;
// }

// function route(uri:string, method:string):any {
//   console.log("f(): evaluated");
//   return async function (targetClass: any, propertyKey: string, descriptor?: any) {
//     console.log(targetClass);
//     console.log(propertyKey);
//     apiRoutes[getRouteKey(uri, method)] = targetClass[propertyKey];
//   }
// }


// chrome.runtime.onMessage.addListener( function(request:any, sender:any, sendResponse:any) {
//   // onMessage.addListener not support async function
//   (async () => {
//     if (request.uri && request.method) {
//       console.log("API:", "from tabId", sender.tab, request);
//       let execFunc = apiRoutes[getRouteKey(request.uri, request.method)];
//       let data = {};
//       if (request.data){
//         data = request.data;
//       }
//       if(execFunc){
//         let resWrapper = execFunc(data);
//         let res;
//         if(resWrapper instanceof Promise){
//           res = await resWrapper;
//         }else{
//           res = resWrapper;
//         }
//         console.log("exec:",res);
//         sendResponse(res);
//       }
//     } else {
//       console.log("unknown request", request);
//     }
//   })();
//   return true;
// });

enum RequestTarget {
  Background,
  CurrentTab,
}

async function request(target: RequestTarget, uri: any, method: any, data: any) {
  let payload = {
    uri: uri,
    method: method,
    data: data,
  };
  if(target === RequestTarget.Background){
    return chrome.runtime.sendMessage(payload);
  }else if(target === RequestTarget.CurrentTab){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs:any) {
      chrome.tabs.sendMessage(tabs[0].id, payload);
    });
  }
}

class Server {
  apiRoutes: {[key:string]:any};
  constructor() {
    this.apiRoutes = {};
  }

  private getRouteKey(uri:string, method:string):string {
    return uri + "#" + method;
  }

  public run(){
    let self = this;
    chrome.runtime.onMessage.addListener( function(request:any, sender:any, sendResponse:any) {
      // onMessage.addListener not support async function
      (async () => {
        if (request.uri && request.method) {
          console.log("API:", "from tabId", sender.tab, request);
          let execFunc = self.apiRoutes[self.getRouteKey(request.uri, request.method)];
          let data = {};
          if (request.data){
            data = request.data;
          }
          if(execFunc){
            let resWrapper = execFunc(data);
            let res;
            if(resWrapper instanceof Promise){
              res = await resWrapper;
            }else{
              res = resWrapper;
            }
            console.log("exec:",res);
            sendResponse(res);
          }
        } else {
          console.log("unknown request", request);
        }
      })();
      return true;
    });
  }
  public route(uri:string, method:string):any {
    console.log("f(): evaluated");
    let self = this;
    return async function (targetClass: any, propertyKey: string, descriptor?: any) {
      console.log(targetClass);
      console.log(propertyKey);
      self.apiRoutes[self.getRouteKey(uri, method)] = targetClass[propertyKey];
      console.log("apiRoutes",self.apiRoutes);
    }
  }



}

export {Server};
export {request};
export {RequestTarget};
