const fs=require('fs')

//读数据库
const userString=fs.readFileSync('./db/users.json').toString()
const usersArray=JSON.parse(userString)

//写数据库
const user3={id:3,name:'朱佑樘',password:"yyy"}
usersArray.push(user3)
const string=JSON.stringify(usersArray) 
fs.writeFileSync('./db/users.json',string)