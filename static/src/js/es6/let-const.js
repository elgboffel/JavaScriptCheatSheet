const points = 50;
let winner = false;

if (points > 0)
    winner = true; //let is in a new scope and won't overwrite the prier 'let winner'.

winner;

const person = { //object person cannot change but properties can.
    name: 'Johnny',
    age: 35
};

person.age = 36; //valid

// person = { age: 56 }; not valid

const frozenPerson = Object.freeze(person); // object properties can no longer change

frozenPerson.name;
