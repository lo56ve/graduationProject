/**
 * Created by Administrator on 2017/4/21.
 */
const express = require('express')
const multer = require('multer')
const fs = require('fs')

const Commodity = require('../models/commodity')
const User = require('../models/user')
const Comment = require('../models/comment')

const router = express.Router();

// 设置图片上传目录位置
const upload = multer({
  dest: 'static/images/upload/'
})

// 注册账号，检查是否已经注册过，state表示注册状态，1为注册成功，0为注册失败
router.post('/loginUp', (req, res) => {
  User.findOne({'email': req.body.email})
    .then(user => {
      if (user === null) {
        var option = req.body
        option.headUrl = 'static/images/nav/logo.png'
        option.name = '普通用户'
        User.create(option, (err,user) => {
          if (err) {
            res.json({state: '0', msg: '注册失败，请稍后重试'})
          } else {
            // 设置保持登录的session
            req.session.user = {id: user._id, useremail: req.body.email, name: user.name, headUrl: user.headUrl}
            res.json({state: '1', msg: '注册成功'})
          }
        })
      } else {
        res.json({state: '0', msg: '注册失败，该账号已存在'})
      }
    })
    .catch(err => {
      res.json({state: '0', msg: '注册失败，请稍后重试'})
    })
})

//账号登录，state表示登录状态，1为登录成功，0为登录失败
router.post('/loginIn', (req, res) => {
  User.findOne({'email': req.body.email})
    .then(user => {
      if (user.psw === req.body.psw) {
        // 设置保持登录的session
        req.session.user = {id: user._id, useremail: req.body.email, name: user.name, headUrl: user.headUrl}
        res.json({state: '1', msg: '登录成功'})
      } else {
        res.json({state: '0', msg: '密码错误，请重新输入'})
      }
    })
    .catch(err => {
      res.json({state: '0', msg: '登录失败，请稍后重试'})
    })
})

// 首页，如果账号已经登录则显示账号名
router.get('/home', (req, res) => {
  if (req.session.user) {
    res.json({islogin: true, name: req.session.user.name, headUrl: req.session.user.headUrl})
  } else {
    res.json({islogin: false})
  }
})

// 修改昵称
router.post('/editName', (req, res) => {
  User.update({_id: req.session.user.id}, {$set: {name: req.body.name}}, err => {
    if (err) {
      res.json({state: '0', msg: '昵称修改失败'})
    } else {
      res.json({state: '1', msg: '昵称修改成功'})
      req.session.user.name = req.body.name
      req.session.save()
    }
  })
})

// 修改头像
router.post('/editHead', (req, res) => {
  User.update({_id: req.session.user.id}, {$set: {headUrl: req.body.headUrl}}, err => {
    if (err) {
      res.json({state: '0', msg: '头像修改失败'})
    } else {
      res.json({state: '1', msg: '头像修改成功'})
      req.session.user.headUrl = req.body.headUrl
      req.session.save()
    }
  })
})

// 获取用户信息（头像和昵称）
router.get('/personInfo' ,(req, res) => {
  User.findById(req.session.user.id)
    .then(user => {
      res.json({name: user.name, headUrl: user.headUrl})
    })
    .catch(err => {
      console.log(err)
    })
})

// 退出登录，删除cookie
router.get('/loginOut', (req, res) => {
  delete req.session.user;
  res.json({state: '0',msg: '退出成功'})
})

// 发布一件商品
router.post('/publish', (req, res) => {
  var option = req.body
  option.poster = req.session.user.name
  option.posterUrl = req.session.user.headUrl
  option.posterId = req.session.user.id
  Commodity.create(option, (err, commodity) => {
    if (err) {
      res.json({state: '0', msg: err})
    } else {
      res.json({state: '1', msg: '发布商品成功'})
    }
  })
})

// 发布商品时候附带的商品照片,还有头像上传
router.post('/upload', upload.single('headUpload'), (req, res) => {
  fs.rename(req.file.path, "static/images/upload/" + req.file.originalname, err => {
    if (err) {
      throw err
      res.json({state: '0', msg: '图片上传失败，请刷新重试'})
    }
    res.json({state: '1', msg: '图片上传成功', headUrl: "static/images/upload/" + req.file.originalname})
  })
})

// 获取商品详细信息
router.post('/detail', (req, res) => {
  Commodity.findById(req.body.itemID)
    .then(commodity => {
      var commodityContent = {
        id: commodity._id,
        name: commodity.name,
        detail: commodity.detail,
        place: commodity.place,
        price: commodity.price,
        bargain: commodity.bargain,
        tel: commodity.tel,
        qq: commodity.qq,
        headUrl: commodity.headUrl,
        poster: commodity.poster,
        posterUrl: commodity.posterUrl,
        created_at: commodity.created_at
      }
      res.json({state: '1', commodity: commodityContent})
    })
    .catch(err => {
      res.json({state: '0', msg: '获取商品详情失败'})
    })
})

// 获取首页的所有商品，state为1表示获取成功，为0表示获取失败d
router.get('/list', (req, res) => {
  Commodity.find({}, '_id name poster price headUrl')
    .then(commodity => {
      var commodityItems = []
      commodity.forEach(item => {
        commodityItems.push({
          id: item._id,
          name: item.name,
          poster: item.poster,
          price: item.price,
          headUrl: item.headUrl
        })
      })
      res.json({commodityItems: commodityItems})
    })
    .catch(err => {
      res.json({state: '0', msg: '获取商品失败，请稍后重试'})
    })
})

// 在发布时候判断用户是否已经登录
router.get('/judgePublish', (req, res) => {
  if (req.session.user) {
    res.json({state: '1', url: '/home/publish'})
  } else {
    res.json({state: '0', msg: '登录之后才能发布商品', url: '/login'})
  }
})

// 获取个人的发布的商品
router.get('/personCommodity', (req, res) => {
  Commodity.find({posterId: req.session.user.id})
    .then(commodity => {
      var commodityItems = []
      commodity.forEach(item => {
        commodityItems.push({
          id: item._id,
          name: item.name,
          price: item.price
        })
      })
      res.json({state: '1', commodityItems: commodityItems})
    })
    .catch(err => {
      res.json({state: '0', msg: '获取商品失败，请稍后重试'})
    })
})

// 对商品发布评论
router.post('/comment', (req, res) => {
  if (req.session.user) {
    var option = {
      commodityID: req.body.id,
      name: req.session.user.name,
      headUrl: req.session.user.headUrl,
      content: req.body.content
    }
    Comment.create(option, (err, Comment) => {
      if (err) {
        res.json({state: '0', msg: err})
      } else {
        res.json({state: '1', msg: '发表评论成功'})
      }
    })
  } else {
    res.json({state: '0', msg: '登录之后才能发表评论', url: '/login'})
  }
})

// 获取商品的评论列表
router.post('/commentList', (req, res) => {
  Comment.find({commodityID: req.body.id})
    .then(comment => {
      var commentItems = []
      comment.forEach(item => {
        commentItems.push({
          name: item.name,
          headUrl: item.headUrl,
          commentContent: item.content,
          created_at: item.created_at
        })
      })
      res.json({state: '1', commentItems: commentItems})
    })
    .catch(err => {
      res.json({state: '0', msg: '获取评论失败'})
    })
})

module.exports = router;
