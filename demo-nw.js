var userName = 'tkringo';
module.exports = {
    'test Yahoo': function (client) {
        client
            .url('https://lol.moa.tw/summoner/show/' + userName)
            .pause(6000)
            .click('#tabs > ul > li:nth-child(4) > a')
            .pause(5000)
            .source((result) => {
                const userObject = [];

                const cheerio = require("cheerio")
                const $ = cheerio.load(result.value)
                var level1 = $('#match_overview > div.table-responsive > table > tbody > tr')


                var person;
                level1.each(function (i, elem) {
                    const _$ = cheerio.load($(this).html());
                    if (i === 20) {
                        return;
                    }
                    if (i % 2 == 0) {
                        person = {
                            name: "",
                            type: "",
                            Avatars: ""
                        };
                        person.name = userName;

                        person.type = _$('th > span:nth-child(3)').text();
                    } else {
                        person.Avatars = _$('td:nth-child(1) > div').attr('data-code');
                        userObject.push(person);
                    }


                });
                console.log(userObject);
            })
            .pause(5000)
            .end();
    }
};