const mongoose = require('mongoose')

const argvNumber = process.argv.length
// console.log(argvNumber);

if (argvNumber < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://ash:${password}@cluster0.nzvtbtd.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (argvNumber === 3) {
  Person.find({}).then((persons) => {
    console.log('phonebook:')
    persons.forEach((person) => {
      //   console.log(person);
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    // console.log(result);
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
