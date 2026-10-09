import fs from 'fs'

const TOYS_FILE = 'data/toy.json'
const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle', 'Outdoor', 'Battery Powered']

const toys = JSON.parse(fs.readFileSync(TOYS_FILE, 'utf8'))
_createToys()

export const toyService = {
    query,
    getById,
    remove,
    save,
}

function query(filterBy = {}) {
    let filteredToys = [...toys]

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }

    if (typeof filterBy.inStock === 'boolean') {
        filteredToys = filteredToys.filter(toy => toy.inStock === filterBy.inStock)
    }

    if (filterBy.labels && filterBy.labels.length) {
        filteredToys = filteredToys.filter(toy => filterBy.labels.every(label => toy.labels.includes(label)))
    }

    if (filterBy.sortBy === 'name') {
        filteredToys.sort((toy1, toy2) => toy1.name.localeCompare(toy2.name))
    } else if (filterBy.sortBy === 'price') {
        filteredToys.sort((toy1, toy2) => toy1.price - toy2.price)
    } else if (filterBy.sortBy === 'createdAt') {
        filteredToys.sort((toy1, toy2) => toy2.createdAt - toy1.createdAt)
    }

    return Promise.resolve(filteredToys)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found')
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('Toy not found')
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        if (idx === -1) return Promise.reject('Toy not found')
        toys[idx] = { ...toys[idx], ...toy }
        return _saveToysToFile().then(() => toys[idx])
    } else {
        toy._id = _makeId()
        toy.createdAt = Date.now()
        toys.push(toy)
        return _saveToysToFile().then(() => toy)
    }
}

function _createToys() {
    if (toys.length) return
    for (let i = 0; i < 12; i++) {
        toys.push(_getRandomToy())
    }
    _saveToysToFile()
}

function _getRandomToy() {
    const shuffledLabels = [...labels].sort(() => Math.random() - 0.5)
    return {
        _id: _makeId(),
        name: 'Toy-' + _getRandomInt(100, 999),
        imgUrl: 'hardcoded-url-for-now',
        price: _getRandomInt(20, 300),
        labels: shuffledLabels.slice(0, _getRandomInt(1, 3)),
        inStock: Math.random() > 0.3,
        createdAt: Date.now() - _getRandomInt(0, 1000 * 60 * 60 * 24 * 30),
    }
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile(TOYS_FILE, JSON.stringify(toys, null, 4), err => {
            if (err) return reject(err)
            resolve()
        })
    })
}

function _makeId(length = 5) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let txt = ''
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

function _getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}