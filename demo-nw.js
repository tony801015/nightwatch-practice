const cheerio = require("cheerio")
const request = require("request")
const fs = require("fs")
const db = require('./database/db');
var userObject = [];
/**** note ****/
//robot
//無詳細資料
module.exports = {
    //get recently ten war's data
    'test lol': (client) => {
        var userName = 'tkringo';
        var url;
        client
            .url('https://lol.moa.tw/summoner/show/' + userName)
            .pause(6000)
            .click('#tabs > ul > li:nth-child(4) > a') //click tab
            .pause(15000)
            .source((result) => {
                //get url's html
                const $ = cheerio.load(result.value);
                //choose to need table
                var level1 = $('#match_overview > div.table-responsive > table > tbody > tr')

                var person; //creat Object
                //level1.each run table's tr
                level1.each(function (i, elem) {
                    const _$ = cheerio.load($(this).html()); //get tr html
                    if (i === 20) { // tr final is 19, i === 20 break
                        return;
                    }
                    if (i % 2 == 0) { //table's tr rule is 0 1 2 3 4 5..., check for even number
                        person = { //object attr
                            id: "",
                            name: "",
                            type1: "",
                            type2: "",
                            peopleNum: "",
                            Time: "",
                            Date: "",
                            result: "",
                            url: "",
                            detil: []
                        };
                        //push value
                        person.name = userName;
                        person.id = _$('th > span:nth-child(1)').text();
                        person.result = _$('th > span:nth-child(2)').text();
                        person.type1 = _$('th > span:nth-child(3)').text();
                        person.type2 = _$('th > span:nth-child(4)').text();
                        person.peopleNum = _$('th > span:nth-child(5)').text();
                        person.Date = _$('th > div').text();
                    } else {
                        person.url = _$('td.h3.text-center > div > div > a').attr('href');
                        var ready = _$('td.h3.text-center > div > div > a').text();
                        //check to push correct data 
                        if (person.type1 == '召喚峽谷' && ready != '準備資料中') {
                            userObject.push(person);
                        }
                    }
                });
            })

    },

    //get this war's people detail data
    'mid ': (client) => {
        for (var i = 0; i < userObject.length; i++) { // userObject.length first step already get 
            level2(userObject, i, client, (callback) => {
                return;
            })

            function level2(userObject, i, client, callback) {
                client
                    .url('https://lol.moa.tw' + userObject[i].url) //get every data's url
                    .pause(5000)
                    .source((result) => {

                        for (var n = 0; n < 10; n++) {
                            var mean_id = n + 2;
                            var k = 'team100k';
                            var d = 'team100d';
                            var a = 'team100a';
                            if (mean_id > 6) {
                                mean_id = mean_id + 1;
                                k = 'team200k';
                                d = 'team200d';
                                a = 'team200a';
                            }
                            var detil_id = n + 2;

                            const __$ = cheerio.load(result.value);
                            userObject[i].Time = __$('#content-body > div.panel.panel-info > div.panel-heading > h3 > span:nth-child(4)').text();

                            var detilObject = new Object();
                            detilObject.lol_id = __$('#content-body > div:nth-child(3) > table > tbody > tr:nth-child(' + mean_id + ') > td:nth-child(2) > span > a').text();
                            detilObject.Avatars = __$('#content-body > div:nth-child(3) > table > tbody > tr:nth-child(' + mean_id + ') > td:nth-child(1) > div').attr('data-code');
                            detilObject.Kill = __$('#content-body > div:nth-child(3) > table > tbody > tr:nth-child(' + mean_id + ') > td:nth-child(3) > span.' + k).text()
                            detilObject.Death = __$('#content-body > div:nth-child(3) > table > tbody > tr:nth-child(' + mean_id + ') > td:nth-child(3) > span.' + d).text()
                            detilObject.Assists = __$('#content-body > div:nth-child(3) > table > tbody > tr:nth-child(' + mean_id + ') > td:nth-child(3) > span.' + a).text()
                            var cs_splite = __$('#content-body > div:nth-child(3) > table > tbody > tr:nth-child(' + mean_id + ') > td:nth-child(8)').text().replace(")", '').split('(');
                            detilObject.cs = parseInt(cs_splite[0]) + parseInt(cs_splite[1])
                            detilObject.KPAR = __$('#content-body > div:nth-child(3) > table > tbody > tr:nth-child(' + mean_id + ') > td:nth-child(4)').text();
                            detilObject.DMG = __$('#content-body > div.table-chart.is-table.table-responsive > table > tbody > tr:nth-child(8) > td:nth-child(' + detil_id + ')').text()
                            userObject[i].detil.push(detilObject);

                            if (n == 9) {
                                console.log('userObject[i]');

                                dbInsert(callback, () => {
                                    db.close();
                                    console.log('close');
                                    callback(null); //back level2
                                })

                                function dbInsert(callback) {
                                    db.select(userObject[i].id, (callback) => {
                                        console.log(callback)
                                        if (callback == false) {
                                            db.insert(userObject[i].id, userObject[i].name, userObject[i].type1, userObject[i].type2, userObject[i].peopleNum, userObject[i].Time, userObject[i].Date, userObject[i].result, userObject[i].url, JSON.stringify(userObject[i].detil));
                                        }
                                    })

                                }
                            }
                        }
                    })
            }
        }
    },

    'end ': (client) => {
        client
            .pause(5000)
            .end();
    }
};