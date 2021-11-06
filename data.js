const mysql = require('mysql');
const db_info = {
    host : 'us-cdbr-east-04.cleardb.com', //호스트 주소 
    port : '3306', //mysql port
    user : 'bd84a717c2fce4',
    password : '40a77de8',
    database : 'heroku_9d21971c5dbc6fb'
}

module.exports = {
    init : function() {
        return mysql.createConnection(db_info);
    },
    connect : function(conn) {
        conn.connect(function(err) {
            if(err) {
                console.error('mysql connection error : ',err);
            }else {
                console.log('mysql success')
            }
        }),
        conn.on('error', function(err) {
            console.log('데이터 베이스 에러!', err.code)
        })
    },
    // error : function(conn) {
    //     conn.connect(function(err) {
    //         if(err) {
    //             console.log(`재실행 불가`,err);
    //         }else{
    //             console.log(`해당오류로 인한 서버 재실행`)
    //         }
    //     })
    // },
}