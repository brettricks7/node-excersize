const express = require('express');
const fetch = (...args) =>
    import('node-fetch').then(({default: fetch}) => fetch(...args));
const router = express.Router();


async function getPerson(baseUrl) {
    const resp = await fetch(`${baseUrl}`);
    return await resp.json();
}

async function getPlanets(optimize) {
    // set some variables
    const baseUrl = `https://swapi.dev/api/planets/?format=json&page=`;
    const basePeopleUrl = `http://localhost:3000/people`
    let page = 1;
    let planets = [];
    let lastResult = [];
    let hash = new Map();
    if (optimize) {
        // sudo db call for performance rather than getting each person 1 by 1 via api.
        try {
            const peopleResponse = await fetch(`${basePeopleUrl}`);
            let peopleResult = await peopleResponse.json();
            for (let i = 0; i < peopleResult.length; i++) {
                hash.set(peopleResult[i].url, peopleResult[i].name)
            }
        } catch (err) {
            console.error(`error has occurred: ${err}`);
        }
    }
    do {
        try {
            const resp = await fetch(`${baseUrl}${page}`);
            const data = await resp.json();
            lastResult = data;
            for (const planet of data?.results) {
                const { name, rotation_period, orbital_period, diameter, climate, gravity, terrain, surface_water, population, films, created, edited, url } = planet;
                let residentsReplace = [];
                for (const resident of planet?.residents) {
                    if (hash.has(resident) && optimize){
                        // this is more performant in our limited set, it was nicer for testing.
                        residentsReplace.push(hash.get(resident))
                    } else {
                        // wasn't sure if you wanted to see how I handled a secondary await, so I did this anyway.
                        const r = await getPerson(resident);
                        residentsReplace.push(r?.name)
                    }
                }
                planets.push({name, rotation_period, orbital_period, diameter, climate, gravity, terrain, surface_water, population, residentsReplace, films, created, edited, url });
            }
            page++;
        } catch (err) {
            console.error(`Oops, something is wrong ${err}`);
        }
    } while (lastResult.next !== null);
    return planets
}



router.get('/', async function (req, res, next) {
    let sortBy = req.query?.sortBy
    let optimize = req.query?.optimize
    let planets = await getPlanets(optimize);
    if(sortBy != null) {
        planets.sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1)
    }
    res.send(planets);
});
module.exports = router;