

function timeFormat(isoDate:string):string{
    const syncDate = new Date(isoDate);
    const year = syncDate.getFullYear();
    const month = syncDate.getMonth() + 1;
    const day = syncDate.getDate();
    const hour = syncDate.getHours();
    const minute = syncDate.getMinutes();
    const second = syncDate.getSeconds();
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

export {timeFormat};