import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import express from 'express'
import mongoose from 'mongoose'
import * as AdminJSMongoose from '@adminjs/mongoose'

import Article from './models/article.js';
import User from './models/user.js'

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
})


const PORT = 3001

const start = async () => {
  await mongoose.connect('mongodb://localhost:27017/blog')
  const adminOptions = {
    resources: [Article, User],
  }
  const app = express()

  const admin = new AdminJS(adminOptions)

  const adminRouter = AdminJSExpress.buildRouter(admin)
  app.use(admin.options.rootPath, adminRouter)

  app.listen(PORT, () => {
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
  })
}

start()