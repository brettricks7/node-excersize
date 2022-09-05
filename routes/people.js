const express = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({default: fetch}) => fetch(...args));
const router = express.Router();

async function getPeople() {
    // set some variables
    const baseUrl = `https://swapi.dev/api/people/?format=json&page=`;
    let page = 1;
    let people = [];
    let lastResult = [];
    do {
        try {
            // start on page 1 and loop through incrementing pages until `next === null`
            const resp = await fetch(`${baseUrl}${page}`);
            const data = await resp.json();
            lastResult = data;
            data.results.forEach(person => {
                const { name, height, films, mass, hair_color, skin_color, eye_color, birth_year, gender, homeworld, species, vehicles, starships, created, edited, url } = person;
                people.push({ name, height, films, mass, hair_color, skin_color, eye_color, birth_year, gender, homeworld, species, vehicles, starships, created, edited, url });
            });
            page++;
        } catch (err) {
            console.error(`error has occurred: ${err}`);
        }
    } while (lastResult.next !== null);
    return people
}

router.get('/', async function (req, res, next) {
    let sortBy = req.query?.sortBy
    let people = await getPeople();
    if(sortBy != null) {
        people.sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1)
    }
    res.send(people);
});
module.exports = router;