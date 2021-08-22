var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/
  const session=JSON.parse(fs.readFileSync('./session.json').toString())//只要有请求,我就读取session.json里的数据

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
    if(path==='/sign_in' && method==='POST'){
      response.setHeader('Content-Type','text/html;charset=utf-8')
      const usersArray=JSON.parse(fs.readFileSync('./db/users.json'))
      const array=[]
      request.on('data',(chunk)=>{ //data就是上传事件
        array.push(chunk) //将上传的每个数据添加到数组里
      })
      request.on('end',()=>{//结束事件
        const string=Buffer.concat(array).toString()//Buffer用于将不同的数据合成为一个字符串
        const obj=JSON.parse(string) // 这里就包含你网页上传的name和password的值
        console.log(typeof obj.password)
        const user=usersArray.find((user)=>user.name===obj.name && user.password===obj.password)
        if(user===undefined){
          response.statusCode=400
          response.setHeader('Content-Type',"text/json;charset=utf-8")
          response.end(`{"errorCode":531}`)
        }
        else{
          response.statusCode=200
          const random=Math.random()
       
          session[random]={user_id:user.id}
          fs.writeFileSync('./session.json',JSON.stringify(session))
          response.setHeader('Set-Cookie',`session_id=${random};HttpOnly`)//账号密码无误就设置Cookie
        }
        response.end()
      })

    }
    else if(path==='/home.html' ){
      const cookie=request.headers['cookie'] //获取到headers里的cookie值，登录的就返回,没登录的就返回undefined
      console.log(cookie)
      if(cookie!==undefined){
        let sessionId
        try {
          sessionId=cookie
          .split(';')
          .filter(s=>s.indexOf('session_id=')>=0)[0]
          .split('=')[1]
        console.log(userId)
        } catch (error) {}
       
     
        if(sessionId && session[sessionId]){ //这里加&&就是说,你这个sessionId不仅要有,而且要是我文件里面存了的id,不能是你自己随便改的
          const userId=session[sessionId].user_id
          console.log(userId)
          const usersArray=JSON.parse(fs.readFileSync('./db/users.json'))
          const user=usersArray.find(user=>user.id===userId)
          const homeHtml=fs.readFileSync('./public/home.html').toString()
          let string
          if(user){

            string=homeHtml.replace('{{loginStatus}}','已登录').replace('{{user.name}}',user.name)
          }else{
            string=homeHtml.replace('{{loginStatus}}','未登录').replace('{{user.name}}',' ')//若没有,则替换成空字符串
          }
          response.write(string)

        }
        else{
          const homeHtml=fs.readFileSync('./public/home.html').toString()
          const string=homeHtml.replace('{{loginStatus}}','未登录').replace('{{user.name}}',' ')
          response.write(string)
        }
    }
      else{
        const homeHtml=fs.readFileSync('./public/home.html').toString()
        const string=homeHtml.replace('{{loginStatus}}','未登录').replace('{{user.name}}',' ')
        response.write(string)
      }
    response.end()

    }
    else if(path==='/register' && method==='POST'){
      response.setHeader('Content-Type','text/html;charset=utf-8')
      const usersArray=JSON.parse(fs.readFileSync('./db/users.json'))
      const array=[]
      request.on('data',(chunk)=>{ //data就是上传事件
        array.push(chunk) //将上传的每个数据添加到数组里
      })
      request.on('end',()=>{//结束事件
        const string=Buffer.concat(array).toString()//Buffer用于将不同的数据合成为一个字符串
        const obj=JSON.parse(string)
        const lastUser=usersArray[usersArray.length-1]
        const newUser={
          id:lastUser?lastUser.id+1 :1, //取到最后一个元素的id,并加一。作为新的ID值
          name:obj.name,
          password:obj.password
        }
        usersArray.push(newUser)
        
        fs.writeFileSync('./db/users.json',JSON.stringify(usersArray))
        response.end('hello')
      })
    }
    else{
      response.statusCode = 200
      const filePath=path==='/'?'/index.html':path //上面代码已用变量path存储了路径名
      const index=filePath.lastIndexOf('.')//获取点最后一次出现的索引是什么
      const suffix=filePath.substring(index)//得到后缀名
      const fileTypes={
          '.js':'text/javascript',
          '.css':'text/css',
          '.html':'text/html',
          '.png':"image/png",
          '.jpg':"image/jpeg",
      }
      response.setHeader('Content-Type', `${fileTypes[suffix]|| 'text/html'};charset=utf-8`)


      let content
      try {
          content=fs.readFileSync(`./public${filePath}`)
          
      } catch (error) {
          content='文件不存在'
          response.statusCode=404
      }
      response.write(content)
    response.end()

    }
    

  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

