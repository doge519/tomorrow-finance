var mongoose = require('../mongoose')
var Schema = mongoose.Schema
var Promise = require('bluebird')

var NewsSchema = new Schema({
    Title: String,
    Content: String,
    Url: String,
    Category: String,
    Author: String,
    DateTime: String
})

var News = mongoose.model('News', NewsSchema)
Promise.promisifyAll(News)
Promise.promisifyAll(News.prototype)

module.exports = News
