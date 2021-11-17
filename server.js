const express = require('express');
const cors = require('cors');
const app = express();
const admin = require('./admin');
const crypto = require('crypto');
app.use(cors());
app.use(express.json());

 
// mysql 
var db_config = require(__dirname + '/data.js');
var conn = db_config.init();

function mysql_event() {
    db_config = require(__dirname + '/data.js');
    conn = db_config.init();
    db_config.connect(conn);
    conn.on('error', function(err) { 
        console.log(`데이터베이스 오류 발생 : `, err.code);
        mysql_event();
    })
}
mysql_event();
function PROTOCOL_CONNECTION_LOST() { // PROTOCOL_CONNECTION_LOST 대한 방지  
    conn.query(`SELECT 1`, function(err, rows, fields) {
        if(err) console.log(err);
        else setTimeout(() => {
            PROTOCOL_CONNECTION_LOST();
        }, 10000);
    })
}
PROTOCOL_CONNECTION_LOST();
    
// 

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`${Date()} : 서버실행완료`)
});

app.get('/', function(req, res) {
    res.send('main page')
})

// join
app.post('/api/join', function(req, res) {
    var join = `INSERT INTO user_data (user_id, user_password) VALUES (?, ?)`// 해당 아이디 비밀번호 db입력
    var join_check = `SELECT * FROM user_data WHERE user_id=` + conn.escape(req.body.u_id); //아이디 중복체크 여부 sql injection 방어

    const password = crypto.createHmac('sha256', admin.secret).update(req.body.u_password).digest('hex'); // 패스워드 암호화

    if(req.body.u_id.search(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi) != -1) { //아이디 특수문자 체크
        return res.send('아이디에 특수문자는 사용이 불가능합니다')
    }
    conn.query(join_check, function(err, rows, fields) {
        if(err) return console.log(`join err`,err.code);

        if(rows[0] == undefined) { // 입력된 id가 존재하지않는 id 일 때
            conn.query(join,[req.body.u_id,password], function (err, rows2, fields) {
                if(err) return console.log(err);
                else{
                    return res.send(`아이디 생성이 완료 되었습니다.`);
                }             
            });
        
        }else return res.send(`이미 아이디가 존재합니다.`); 
    })
})

// login 
app.post('/api/login', function(req, res) {
    // res.send('login');
    var login = `SELECT * FROM user_data WHERE user_id= ` + conn.escape(req.body.u_id); //sql injection 방어 
    const password = crypto.createHmac('sha256', admin.secret).update(req.body.u_password).digest('hex');
    conn.query(login, function(err, rows, fields) {
        if(err) console.log(err)
        if(!rows[0]) {
            return res.send(`존재하지않는 아이디 입니다.`)
        }

        if(rows[0].user_password == password) {
            console.log('로그인승인 : ', req.body.u_id)
            return res.send(`success`);
        }else {
            return res.send(`비밀번호가 맞지않습니다.`)
        }; 
    })
})  

// pick

app.post('/api/pick',function(req, res) {
    var check = `SELECT * FROM hex_pick WHERE user_name=? and hex_index = ?;` // 존재 여부 체크 
    var plus = `INSERT INTO hex_pick (user_name, hex_index, hex_name) VALUES (?, ?, ?);`; // 추가
    var del = `DELETE FROM hex_pick WHERE user_name=`+ conn.escape(req.body.user) + `and hex_index=`+ conn.escape(req.body.hex); // 삭제
    conn.query(check,[req.body.user,req.body.hex], function(err, rows, fields) {
        if(err) return console.log(err);
        
        if(rows[0] == undefined) {
            conn.query(plus,[req.body.user,req.body.hex,req.body.hex_name], function(err, rows2, fields) {
                if(err) return console.log(err);
                
            })
        }else {
            conn.query(del, function(err, rows3, fields) {
                if(err) return console.log(err);
                
            })
        }
    })
})


app.post('/api/pick/check', function(req, res) {
    var check_pick = `SELECT * FROM hex_pick WHERE user_name= `+ conn.escape(req.body.u_id);
    conn.query(check_pick, function(err, rows, fields) {
        console.log(check_pick);
        console.log('pick',req.body.u_id);
        if(err) return console.log(err);
        else{
            res.send(rows);
        }
    })
})


