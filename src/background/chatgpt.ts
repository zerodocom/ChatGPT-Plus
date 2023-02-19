

const endpoint = "https://chat.openai.com";
let accessToken;

async function authFetch(input: RequestInfo | URL, init: RequestInit = {}){
    const accessToken = await getAccessToken();
    let initData = init;
    if(!initData.headers){
        initData.headers = {};
    }
    // @ts-ignore
    initData.headers['Authorization'] = "Bearer " + accessToken;
    // @ts-ignore
    initData.headers['Content-Type'] = 'application/json';
    return await fetch(input, init);
}

async function getAccessToken(): Promise<string|undefined> {
    const resp = await fetch(endpoint +'/api/auth/session');
    if (resp.status === 403) {
        return undefined;
    }
    const data = await resp.json().catch(() => ({}))
    if (!data.accessToken) {
        return undefined;
    }
    accessToken = data.accessToken;
    return data.accessToken;
}

async function getConversations(offset:number, limit:number){
    const url = endpoint +'/backend-api/conversations?offset=' + offset + "&limit=" + limit;
    const resp = await authFetch(url);
    const data = resp.json();
    return data;
}

async function getConversation(conversationId:string){
    const url = 'https://chat.openai.com/backend-api/conversation/' + conversationId;
    const resp = await authFetch(url);
    const data = resp.json();
    return data;
}

async function getChatModels(){
    const url = endpoint +'/backend-api/models';
    const resp = await authFetch(url);
    const data = resp.json();
    return data;
}

async function getAllConversations(){

    const limit = 100;
    const result = await getConversations(0, 1);
    let total = result.total;
    // sync less than 1000 records
    if(total > 1000){
        total = 1000;
    }
    console.log(result);
    let items:any[] = [];
    for (let page = 0; page < total; page += limit) {
        let result = await getConversations(page, limit);
        console.log(result);
        items = items.concat(result["items"]);
    }
    return items;
}

export {getAccessToken};
export {getAllConversations};
export {getConversation};