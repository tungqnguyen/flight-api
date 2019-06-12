
    //old insert query
        // parse(response.data, function(err, records) {
        //     const cols = records[0].join(" TEXT, ") + ' TEXT';
        //     const sql = `CREATE TABLE IF NOT EXISTS airport ( ${cols} )`;
        //     let placeholders = records[0].map((value) => '?').join(',');
        //     // console.log('placeholders', placeholders);
        //     db.serialize(() => {
        //         console.log('')
        //         db.run(sql,(error) => { })
        //         for (let i = 1; i < records.length; i++) {
        //             db.run(`INSERT INTO airport VALUES ( ${placeholders} )`, records[i], () => console.log('adding record...'));
        //         }
        //     })
        //     db.close();
        // })