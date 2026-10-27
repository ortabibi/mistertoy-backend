import path from 'path'
import express from 'express'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',

        'http://127.0.0.1:5174',
        'http://localhost:5174',
    ],
    credentials: true,
}

// Express Config:
app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(express.json())

// Express Routing:

// REST API for Toys
app.get('/api/toy', async (req, res) => {
    const labels = req.query.labels || req.query['labels[]'] || []
    const filterBy = {
        txt: req.query.txt || '',
        inStock: req.query.inStock === undefined || req.query.inStock === ''
            ? undefined
            : req.query.inStock === 'true',
        labels: Array.isArray(labels) ? labels : [labels],
        sortBy: req.query.sortBy || '',
    }
    try {
        const toys = await toyService.query(filterBy)
        res.send(toys)
    } catch (err) {
        loggerService.error('Cannot get toys', err)
        res.status(400).send('Cannot get toys')
    }
})

app.get('/api/toy/:toyId', async (req, res) => {
    const { toyId } = req.params
    try {
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('Cannot get toy', err)
        res.status(400).send('Cannot get toy')
    }
})

app.post('/api/toy', async (req, res) => {
    const toy = {
        name: req.body.name,
        imgUrl: req.body.imgUrl,
        price: +req.body.price,
        labels: req.body.labels || [],
        inStock: req.body.inStock,
    }
    try {
        const savedToy = await toyService.save(toy)
        res.send(savedToy)
    } catch (err) {
        loggerService.error('Cannot save toy', err)
        res.status(400).send('Cannot save toy')
    }
})

app.put('/api/toy/:id', async (req, res) => {
    const toy = {
        _id: req.params.id,
        name: req.body.name,
        imgUrl: req.body.imgUrl,
        price: +req.body.price,
        labels: req.body.labels || [],
        inStock: req.body.inStock,
    }
    try {
        const savedToy = await toyService.save(toy)
        res.send(savedToy)
    } catch (err) {
        loggerService.error('Cannot save toy', err)
        res.status(400).send('Cannot save toy')
    }
})

app.delete('/api/toy/:toyId', async (req, res) => {
    const { toyId } = req.params
    try {
        await toyService.remove(toyId)
        res.send('Removed!')
    } catch (err) {
        loggerService.error('Cannot remove toy', err)
        res.status(400).send('Cannot remove toy')
    }
})

app.use((req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)