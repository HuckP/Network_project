const express = require('express');
const router = express.Router();
const connection = require('../database/index');

connection.connect();
/* GET home page. */
router.get('/', (req, res, next) => {
  connection.query('SELECT * FROM blog', (err, rows) => {
    if(err) res.send(err);

    res.render('list', { rows: rows, logged: req.session.logged, user_name: req.session.user_name, user_id: req.session });
  });
});

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  let body = req.body;
  let user_id = body.user_id;
  let password = body.password;
  connection.query(`SELECT * FROM users WHERE user_id = '${user_id}'`, (err, rows) => {
    if(err) res.send(err);

    if(rows[0]) {
      connection.query(`SELECT * FROM users WHERE password = '${password}'`, (err, rows) => {
        req.session.logged = true;
        req.session.user_id = rows[0].user_id;
        req.session.user_name = rows[0].user_name;
        res.redirect('/');
      });
    } else {
      res.send('<script>alert("아이디 또는 비밀번호가 틀립니다.");</script>');
    }
  });
});

router.get('/register', (req, res, next) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  let user_name = req.body.user_name;
  let user_id = req.body.user_id;
  let password = req.body.password;
  let password2 = req.body.password2;

  connection.query(`SELECT * FROM users WHERE user_id = '${user_id}'`, (err, rows) => {
    if(err) res.send(err);;

    if(password != password2) {
      res.send('<script>alert("비밀번호가 틀립니다.");location.replace("/register");</script>');
    } else if(rows[0] != undefined) {
      res.send('<script>alert("아이디가 중복됩니다.");location.replace("/register");</script>');
    } else {
      connection.query(`INSERT INTO users(user_name, user_id, password) VALUES ('${user_name}', '${user_id}', '${password}')`, (err, result) => {
        if(err) res.send(err);

        res.send('<script>alert("계정이 생성되었습니다. 로그인 해주세요");location.replace("/");</script>');
      });
    }
  });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/write', (req, res, next) => {
  res.render('write', { logged: req.session.logged });
});

router.post('/write',(req, res, next) => {
  let title = req.body.title;
  let description = req.body.description;
  let user_name = req.session.user_name;

  if(!req.session.logged) {
    res.send('<script>alert("로그인을 해야합니다.");location.replace("/login");</script>');
  } else {
    connection.query(`INSERT INTO blog(title, description, user, created) VALUES ('${title}', '${description}', '${user_name}', NOW())`, (err, result) => {
      if(err) res.send(err);;
  
      res.send('<script>alert("글이 생성되었습니다.");location.replace("/");</script>');
    });
  }
});

router.get('/detail/:id', (req, res, next) => {
  let id = req.params.id;
  let user_id = req.session.user_id;    //session에 저장된 아이디
  connection.query(`SELECT * FROM blog LEFT JOIN users ON blog.user=users.user_name WHERE blog.id = ${id}`, (err, rows) => {
    if(err) res.send(err);;

    res.render('detail', { rows: rows[0], user_id: user_id });
  });
});

router.get('/update/:id', (req, res, next) => {
  let user_id = req.session.user_id;
  let id = req.params.id;
  if(!user_id) {
    res.send('<script>alert("로그인 해주세요");location.replace("/login");</script>');
  } else {
    connection.query(`SELECT * FROM blog LEFT JOIN users ON blog.user=users.user_name WHERE blog.id = ${id}`, (err, rows) => {
      if(err) res.send(err);;

      if(user_id != rows[0].user_id){
        res.send('<script>alert("다른 유저의 글 수정은 불가합니다.");location.replace("/");</script>');
      } else {
        // res.render('update');
        console.log("hello");
      }
    });
  }
  
});

router.get('/delete/:id', (req, res, next) => {
  let user_id = req.session.user_id;
  let id = req.params.id;
  if(!user_id) {
    res.send('<script>alert("로그인 해주세요");location.replace("/login");</script>');
  } else {
    connection.query(`SELECT * FROM blog LEFT JOIN users ON blog.user=users.user_name WHERE blog.id = ${id}`, (err, rows) => {
      if(err) res.send(err);;

      if(user_id != rows[0].user_id){
        res.send('<script>alert("다른 유저의 글 삭제은 불가합니다.");location.replace("/");</script>');
      } else {
        connection.query(`DELETE FROM blog WHERE id = ${id}`, (err, result) => {
          if(err) res.send(err);;
          
          res.send('<script>alert("삭제가 되었습니다.");location.replace("/");</script>');
        });
      }
    });
  }
})
module.exports = router;
