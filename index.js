const express = require("express");
const morgan = require("morgan");

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

const app = express();
app.use(express.static("dist"));
app.use(express.json());

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body",
    { skip: (req, res) => req.method !== "POST" }
  )
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  const message = `Phonebook has info for ${
    persons.length
  } people<br/>${new Date()}`;
  response.send(message);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    return response.json(person);
  } else {
    // response.statusMessage = "Current person does not find";
    return response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  if (persons.some((person) => person.id === id)) {
    persons = persons.filter((person) => person.id !== id);
    return response.status(204).end();
  }
  return response.status(404).end();
});

const generateId = () => {
  return String(Math.floor(Math.random() * 10000000000));
};

app.post("/api/persons", (request, response) => {
  const name = request.body.name;
  const number = request.body.number;
  if (!name) {
    return response.status(400).json({ error: "name is required" });
  }
  if (!number) {
    return response.status(400).json({ error: "number is required" });
  }
  if (persons.some((person) => person.name === name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const person = {
    name: request.body.name,
    number: request.body.number,
    id: generateId(),
  };
  persons = persons.concat(person);
  response.status(201).json(person);

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
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
