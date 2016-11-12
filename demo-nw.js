module.exports = {
    'test Yahoo': function (client) {
        client

            .url('https://tw.yahoo.com')
            .waitForElementVisible('body')
            .setValue('input[type=text]', '美國總統大選')
            .click('input[id=UHSearchWeb]')
            .pause(2000)
            .assert.containsText('div.sys_northalsotry', '美國總統大選2016日期')
            .waitForElementVisible('div.sys_northalsotry')
            .source((result) => {
                const cheerio = require("cheerio")
                const $ = cheerio.load(result.value)
                console.log($('div.sys_northalsotry').text());

            })
            .end();

    }
};
