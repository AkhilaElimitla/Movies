const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("starts");
    });
  } catch (e) {
    process.exit();
  }
};

initializeDbAndServer();

const convertMovieToJson = (each) => ({
  movieName: each.movie_name,
});

const convertDirector = (each) => ({
  directorId: each.director_id,
  directorName: each.director_name,
});

const convertMovieToId = (each) => ({
  movieId: each.movie_id,
  directorId: each.director_id,
  movieName: each.movie_name,
  leadActor: each.lead_actor,
});

app.get("/movies/", async (request, response) => {
  const query = `select movie_name from movie`;
  const arrayRes = await db.all(query);
  response.send(arrayRes.map((each) => convertMovieToJson(each)));
});

app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const query = `insert into movie(director_id,movie_name,lead_actor) values(${directorId},'${movieName}','${leadActor}');`;
  await db.run(query);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `select * from movie where movie_id=${movieId}`;
  const res = await db.get(query);
  response.send(convertMovieToId(res));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const query = `update movie set director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}' where movie_id=${movieId}`;
  await db.run(query);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `delete from movie where movie_id=${movieId}`;
  await db.run(query);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const query = `select * from director`;
  const arrayRes = await db.all(query);
  response.send(arrayRes.map((each) => convertDirector(each)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `select movie_name from movie where director_id=${directorId}`;
  const res = await db.all(query);
  response.send(res.map((each) => convertMovieToJson(each)));
});

module.exports = app;
