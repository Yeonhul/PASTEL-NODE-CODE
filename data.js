const mysql = require('mysql');
const admin = require('./admin');

const db_info = {
    host : admin.host, 
    port : admin.port, 
    user : admin.user,
    password : admin.password,
    database : admin.database
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
}