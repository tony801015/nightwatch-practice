const sqlite3 = require('sqlite3')

var db = new sqlite3.Database('./database/lol_db.sqlite')

module.exports = {
    insert: (id, name, type1, type2, peopleNum, Time, Date, result, url, detil) => {
        db.serialize(() => {
            var insert = db.prepare('insert into lol_data values (?,?,?,?,?,?,?,?,?,?)')

            insert.run(id, name, type1, type2, peopleNum, Time, Date, result, url, detil);
            insert.finalize();
        });
    },
    select: (id, callback) => {

        db.serialize(() => {
            selectdb(callback, (result) => {
                callback(result)
            })

            function selectdb(callback) {
                db.each('select count(*) as count from lol_data where id =' + id, (err, row) => {
                    var check
                    if (row.count != 0) {
                        check = true;
                    } else {
                        check = false;
                    }
                    callback(check)
                        // console.log(JSON.stringify(row) + ":" + row.id + ":" + row.name);
                })
            }


        })

    },
    close: () => {
        db.close()
    }
}