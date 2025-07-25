require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

const app = express()
app.use(express.static('dist'))
app.use(express.json())

app.use(morgan('tiny', { skip: (req) => req.method === 'POST' }))
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    { skip: (req) => req.method !== 'POST' }
  )
)

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    const message = `Phonebook has info for ${
      persons.length
    } people<br/>${new Date()}`
    response.send(message)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      // console.log(person); //null
      if (person) {
        return response.json(person)
      } else {
        // response.statusMessage = "Current person does not find";
        return response
          .status(404)
          .send({ error: 'Current person does not find' })
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      // console.log(result);
      if (!result) {
        return response.status(404).end()
      }
      return response.status(204).end()
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  // console.log(request.body);
  const { number } = request.body
  const opts = { runValidators: true }

  Person.findByIdAndUpdate(request.params.id, { number: number }, opts)
    .then((person) => {
      // console.log(person);
      if (person) {
        response.json(person)
      } else {
        response.status(404).send({ error: 'Current person does not find' })
      }
    })
    .catch((error) => next(error))

  // Person.findById(request.params.id)
  //   .then((person) => {
  //     if (!person) {
  //       return response.status(404).end();
  //     }

  //     person.name = name;
  //     person.number = number;

  //     return person.save().then((updatedPerson) => {
  //       response.json(updatedPerson);
  //     });
  //   })
  //   .catch((error) => next(error));
})

// const generateId = () => {
//   return String(Math.floor(Math.random() * 10000000000));
// };

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name) {
    return response.status(400).json({ error: 'name is required' })
  }
  if (!number) {
    return response.status(400).json({ error: 'number is required' })
  }
  // if (persons.some((person) => person.name === name)) {
  //   return response.status(400).json({ error: "name must be unique" });
  // }

  const person = new Person({
    name: name,
    number: number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson)
    })
    .catch((error) => next(error))

  //   switch (true) {
  //     case !name:
  //       return response.status(400).json({ error: "name is required" });
  //     case !number:
  //       return response.status(400).json({ error: "number is required" });
  //     case persons.some((person) => person.name === name):
  //       return response.status(400).json({ error: "name must be unique" });
  //     default:
  //       const person = {
  //         name: request.body.name,
  //         number: request.body.number,
  //         id: generateId(),
  //       };
  //       persons = persons.concat(person);
  //       response.status(201).json(person);
  //       break;
  //   }
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
