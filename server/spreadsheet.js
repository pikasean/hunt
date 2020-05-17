const { GoogleSpreadsheet } = require('google-spreadsheet');
const key = require('./server-key.json');

async function init() {
    const doc = new GoogleSpreadsheet('1vYE0U_GbDKHW5ZZsUqt4d6-3UOYeehwM8tWS5VQxTbE');
    await doc.useServiceAccountAuth(key);
    await doc.loadInfo();
    return doc;
}

async function total(doc) {
    const sheet = doc.sheetsByIndex[2];
    await sheet.loadCells();
    return parseInt(sheet.getCellByA1('B1'));
}

async function accessSheet(sheet, total) {
    await sheet.loadHeaderRow();
    await sheet.loadCells();
    const rows = await sheet.getRows({offset: 0, limit: total});
    const headers = sheet.headerValues;

    let JSON = [];
    for (const row of rows) {
        let obj = {};
        for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = row[headers[i]];
        }
        JSON.push(obj);
    }
    return JSON;
}

async function accessCredentials() {
    const doc = await init();
    const totalGroups = await total(doc);
    const sheet = doc.sheetsByIndex[0];
    return accessSheet(sheet, totalGroups);
}

async function accessLeaderboard() {
    const doc = await init();
    const totalGroups = await total(doc);
    const sheet = doc.sheetsByIndex[1];
    return accessSheet(sheet, totalGroups);
}

module.exports = {credentials: accessCredentials, leaderboard: accessLeaderboard};