/// <reference types="chrome"/>

enum RequestTarget {
  Background,
  CurrentTab,
}

async function request(target: RequestTarget|number, uri: any, method: any, data: any) {
  let payload = {
    uri: uri,
    method: method,
    data: data,
  };
  if(target === RequestTarget.Background){
    return chrome.runtime.sendMessage(payload);
  }else if(target === RequestTarget.CurrentTab){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs:any) {
      console.log("send data to tabId", tabs[0], payload);
      chrome.tabs.sendMessage(tabs[0].id, payload);
    });
  }else{
    return chrome.tabs.sendMessage(target, payload);
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
    // todo: 可以把这个与修饰时候的结构函数合一
    console.log("Start APIServer", this.apiRoutes);
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
          }else{
            console.error("API not found", "from tabId", sender.tab, request);
          }
        } else {
          console.log("unknown request", request);
        }
      })();
      return true;
    });
  }
  public route(uri:string, method:string):any {
    let self = this;
    return async function (targetClass: any, propertyKey: string, descriptor?: any) {
      console.log("Set uri", uri, "method", method, "function", targetClass[propertyKey]);
      self.apiRoutes[self.getRouteKey(uri, method)] = targetClass[propertyKey];
    }
  }



}

export {Server};
export {request};
export {RequestTarget};
