import express from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'node:url'

const uploadsDirectory = fileURLToPath(
  new URL('../../uploads/', import.meta.url),
)

const serveUploads = [
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
  express.static(uploadsDirectory, {
    maxAge: '1y',
    immutable: true,
  }),
]

export default serveUploads
