/* eslint-disable no-return-assign */
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import { randomUUID as uuid } from 'node:crypto'

const app = express()
const PORT = process.env.PORT ?? 5000

const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong, please try again!' })
}

const parkingSpaces = []
const visitors = []

const config = {
  xXssProtection: 1
}

app.use(cors())
app.use(helmet(config))
app.use(bodyParser.json())
app.use(errorHandler)

// Get all parking spaces
app.get('/app', (req, res) => {
  res.json(parkingSpaces)
})

// Get all visitors
app.get('/app/visitors', (req, res) => {
  res.json(visitors)
})

// Get visitor by license plate
app.get('/app/visitors/:licensePlate', (req, res) => {
  const { licensePlate } = req.params
  const visitor = visitors.find(v => v.licensePlate.toLowerCase() === licensePlate.toLowerCase())

  if (!visitor) {
    return res.status(400).json({ error: 'Visitor not found!' })
  }

  res.status(200).json(visitor)
})

// Adding a new visitor
app.post('/app/visitors', (req, res) => {
  const {
    licensePlate,
    make,
    model,
    isNewVisitor
  } = req.body

  const existingVisitor = visitors.find(visitor => visitor.licensePlate === licensePlate)

  if (existingVisitor) {
    return res.status(400).json({ error: 'Visitor already exists' })
  }

  const newVisitor = {
    licensePlate,
    make,
    model,
    isNewVisitor
  }

  visitors.push(newVisitor)

  res.status(201).json(newVisitor)
})

// Create parking spaces
app.post('/app/spaces', (req, res) => {
  const { quantity } = req.body

  if (quantity <= 0) {
    return res.status(400).json({ error: 'Must be a positive number' })
  }

  const newSpaces = Array.from(Array(quantity), (_, index) => {
    return {
      Id: parkingSpaces.length + index + 1,
      voucherId: uuid(),
      isAvailable: true
    }
  })

  parkingSpaces.push(newSpaces)

  res.status(201).json(newSpaces)
})

// Delete visitor by license plate
app.delete('/app/visitors/:licensePlate', (req, res) => {
  const { licensePlate } = req.params

  const deletedVisitor = visitors.filter(visitor => visitor.licensePlate !== licensePlate)

  if (deletedVisitor === false) {
    return res.status(404).json({ error: 'Visitor not found' })
  }

  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
