const cheerio = require("cheerio")
const request = require("request")
var userObject = [];
/**** note ****/
//check word is 準備中 or 查看詳細資料 因為會不同tag
//check type is ng
//fs write document (add)

module.exports = {
    'test lol': (client) => {
        var userName = 'tkringo';

        var url;
        client
            .url('https://lol.moa.tw/summoner/show/' + userName)
            .pause(6000)
            .click('#tabs > ul > li:nth-child(4) > a')
            .pause(5000)
            .source((result) => {
                const $ = cheerio.load(result.value)
                var level1 = $('#match_overview > div.table-responsive > table > tbody > tr')

                var person;
                level1.each(function (i, elem) {
                    const _$ = cheerio.load($(this).html());
                    if (i === 20) {
                        return;
                    }

                    if (i % 2 == 0) {
                        // person = new Object();
                        person = {
                            id: "",
                            name: "",
                            type: "",
                            Avatars: "",
                            peopleNum: "",
                            Time: "",
                            Date: "",
                            result: "",
                            url: "",
                            detil: []
                        };
                        person.name = userName;

                        person.id = _$('th > span:nth-child(1)').text();
                        person.result = _$('th > span:nth-child(2)').text();
                        person.type = _$('th > span:nth-child(4)').text();
                        person.peopleNum = _$('th > span:nth-child(5)').text();
                        person.Date = _$('th > div').text();
                    } else {
                        person.Avatars = _$('td:nth-child(1) > div').attr('data-code');
                        person.url = _$('td.h3.text-center > div > div > a').attr('href');
                        userObject.push(person);
                    }
                });
            })

    },

    'mid ': (client) => {
        for (var i = 0; i < userObject.length; i++) {

            level0(userObject, i, client, (callback) => {
                return;
            })

            function level0(userObject, i, client, callback) {
                client
                    .url('https://lol.moa.tw' + userObject[i].url) //0~9
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
                                console.log(userObject[i]);
                                callback(null);
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