var mongoose = require('../mongoose')
var News = mongoose.model('News')

const getNews = (req, res) => {
    var by = req.query.by,
        id = req.query.id,
        key = req.query.key,
        limit = req.query.limit,
        page = req.query.page
    page = parseInt(page, 10)
    limit = parseInt(limit, 10)
    if (!page) page = 1
    if (!limit) limit = 10
    var data = {
            is_delete: 0
        },
        skip = (page - 1) * limit
    if (id) {
        data.category = id
    }
    if (key) {
        var reg = new RegExp(key, 'i')
        data.title = {$regex : reg}
    }
    var sort = '-update_date'
    if (by) {
        sort = '-' + by
    }

    var filds = 'Title Content Url Category Author DateTime'

    Promise.all([
        News.find(data, filds).sort(sort).skip(skip).limit(limit).exec(),
        News.countAsync(data)
    ]).then(([data, total]) => {
        var arr = [],
            totalPage = Math.ceil(total / limit),
            user_id = req.cookies.userid
        data = data.map(item => {
            item.content = item.content.substring(0, 500) + '...'
            return item
        })
        var json = {
            code: 200,
            data: {
                list: data,
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1
            }
        }
        if (user_id) {
            data.forEach(item => {
                arr.push(Like.findOneAsync({ news_id: item._id, user_id }))
            })
            Promise.all(arr).then(collection => {
                data = data.map((item, index) => {
                    item._doc.like_status = !!collection[index]
                    return item
                })
                json.data.list = data
                res.json(json)
            }).catch(err => {
                res.json({
                    code: -200,
                    message: err.toString()
                })
            })
        } else {
            data = data.map(item => {
                item._doc.like_status = false
                return item
            })
            json.data.list = data
            res.json(json)
        }
    }).catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
}

module.exports = {
    getNews
}